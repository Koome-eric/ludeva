'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUserFromDB } from '@/lib/user';

// Deposit schema now includes optional investmentId
const depositSchema = z.object({
  amount: z.number().min(100),
  phone: z.string().optional(),
  paymentMethod: z.enum(['mpesa', 'stripe_card']),
  investmentId: z.string().optional(),
});

/**
 * 1. Get M-Pesa Access Token
 */
async function getMpesaAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  if (!consumerKey || !consumerSecret) throw new Error('Missing M-Pesa credentials');

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    cache: 'no-store',
  });

  const data = await res.json();
  return data.access_token;
}

/**
 * 2. Handle M-Pesa STK Push
 */
export async function handleMpesaStkPush(phone: string, amount: number) {
  const accessToken = await getMpesaAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (!shortcode || !passkey || !callbackUrl) throw new Error('Missing M-Pesa environment variables');

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: 'Investment Deposit',
    TransactionDesc: 'Wallet Top Up',
  };

  const API_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data;
}

/**
 * 3. Initiate Deposit
 */
export async function initiateDeposit(input: z.infer<typeof depositSchema>) {
  const parsed = depositSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: 'Invalid deposit data' };

  const { amount, phone, paymentMethod, investmentId } = parsed.data;

  // Get current user
  const user = await getCurrentUserFromDB();
  if (!user) return { success: false, message: 'User not authenticated' };

  // If investmentId is provided, validate it belongs to the user
  let investmentExists = null;
  if (investmentId) {
    investmentExists = await prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investmentExists || investmentExists.userId !== user.id) {
      return { success: false, message: 'Invalid investment selected' };
    }
  }

  if (paymentMethod === 'mpesa') {
    if (!phone) return { success: false, message: 'Phone number required for M-Pesa' };

    try {
      const stkResponse = await handleMpesaStkPush(phone, amount);

      if (stkResponse.ResponseCode !== '0') {
        return { success: false, message: stkResponse.CustomerMessage || 'M-Pesa error' };
      }

      // Store pending payment linked to investment
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount,
          method: 'MPESA',
          status: 'PENDING',
          reference: stkResponse.CheckoutRequestID,
          description: investmentExists
            ? `Deposit to Investment: ${investmentExists.productName}`
            : 'Wallet Top Up',
          investmentId: investmentExists?.id,
        },
      });

      return {
        success: true,
        message: 'STK Push sent! Check your phone to complete the payment.',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to initiate deposit' };
    }
  }

  if (paymentMethod === 'stripe_card') {
    return { success: false, message: 'Stripe payments not yet configured' };
  }

  return { success: false, message: 'Unsupported payment method' };
}

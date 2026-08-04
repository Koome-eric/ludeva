/**
 * M-Pesa STK Push API Route
 * 
 * POST /api/mpesa/stk-push
 * 
 * Initiates an M-Pesa payment prompt on the user's phone
 * This route must be called from the backend (via DepositForm action)
 */

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { stkPush } from '@/lib/mpesa';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify KYC has been approved by an admin — checking login alone here
    // was the gap that let unapproved/unverified sign-ups initiate real
    // M-Pesa deposits. A page-level redirect isn't enough on its own since
    // this endpoint can be called directly.
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser || !dbUser.onboardingCompleted) {
      return NextResponse.json(
        { success: false, error: 'Please complete onboarding before making a deposit.' },
        { status: 403 }
      );
    }
    if (dbUser.kycStatus !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error:
            dbUser.kycStatus === 'REJECTED'
              ? 'Your KYC verification was not approved. Please contact support before depositing.'
              : 'Your account is still awaiting KYC approval. Deposits unlock once an admin verifies your account.',
        },
        { status: 403 }
      );
    }

    const { phone, amount } = await req.json();

    // Validate inputs
    if (!phone || !amount) {
      return NextResponse.json(
        { success: false, error: 'Phone and amount are required' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!/^254\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number. Use format 2547XXXXXXXX',
        },
        { status: 400 }
      );
    }

    // Validate amount
    const parsedAmount = parseInt(amount, 10);
    if (!Number.isInteger(parsedAmount) || parsedAmount < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum amount is KES 100' },
        { status: 400 }
      );
    }

    // Call M-Pesa
    const response = await stkPush({
      phone,
      amount: parsedAmount,
      reference: `LUDEVA-${userId.slice(0, 8)}-${Date.now()}`,
      description: 'Ludeva Investment Wallet Deposit',
    });

    // ✅ Success response from Daraja
    if (response.ResponseCode === '0') {
      return NextResponse.json({
        success: true,
        message: 'M-Pesa prompt sent to your phone. Please enter your PIN.',
        checkoutRequestID: response.CheckoutRequestID,
        merchantRequestID: response.MerchantRequestID,
      });
    }

    // ❌ Daraja returned an error
    return NextResponse.json(
      {
        success: false,
        error: response.errorMessage || 'Failed to initiate payment',
        details: response,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('STK Push Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initiate M-Pesa payment',
      },
      { status: 500 }
    );
  }
}

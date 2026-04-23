/**
 * M-Pesa Daraja API Integration
 * 
 * Handles all communication with Safaricom's Daraja API
 * This is the Node.js equivalent of the PHP Daraja class
 * 
 * ⚠️ IMPORTANT: This runs server-side only. Never expose secrets to the browser.
 */

import crypto from 'crypto';

// Use sandbox for development/testing, production for live
const MPESA_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

/**
 * Get M-Pesa access token from Daraja API
 * 
 * Required Environment Variables:
 * - MPESA_CONSUMER_KEY
 * - MPESA_CONSUMER_SECRET
 */
export async function getAccessToken() {
  if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
    throw new Error('MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET environment variables are required');
  }

  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await fetch(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('[M-PESA] Token Error Response:', { status: res.status, text: text.substring(0, 500) });
    throw new Error(`Failed to get access token: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

/**
 * Initiate STK Push (M-Pesa prompt on user's phone)
 * 
 * This is the main entry point for M-Pesa payments
 * 
 * @param phone - Kenyan phone number (2547XXXXXXXX format)
 * @param amount - Amount in KES (integer)
 * @param reference - Business reference (e.g., order ID)
 * @param description - Transaction description
 */
export async function stkPush({
  phone,
  amount,
  reference,
  description,
}: {
  phone: string;
  amount: number;
  reference: string;
  description: string;
}) {
  // Validate inputs
  if (!phone || !amount || !reference || !description) {
    throw new Error('Phone, amount, reference, and description are required');
  }

  // Validate phone number format (2547XXXXXXXX)
  if (!/^254\d{9}$/.test(phone)) {
    throw new Error('Phone number must be in format 2547XXXXXXXX');
  }

  // Amount must be positive integer
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Amount must be a positive integer');
  }

  if (!process.env.MPESA_SHORTCODE || !process.env.MPESA_PASSKEY) {
    throw new Error('MPESA_SHORTCODE and MPESA_PASSKEY environment variables are required for STK push');
  }

  const token = await getAccessToken();

  // Generate timestamp (YYYYMMDDHHmmss format)
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);

  // Generate password (base64 encoded: SHORTCODE+PASSKEY+TIMESTAMP)
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: reference,
    TransactionDesc: description,
  };

  const res = await fetch(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  // Get raw response text first
  const responseText = await res.text();
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('[M-PESA] Invalid JSON response:', responseText);
    throw new Error(`Invalid M-Pesa API response: ${responseText.substring(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(`STK Push failed: ${data.errorMessage || res.statusText}`);
  }

  return data;
}

/**
 * Query transaction status
 * 
 * Check if a transaction went through using the checkout request ID
 */
export async function queryTransaction(checkoutRequestID: string) {
  const token = await getAccessToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);

  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestID,
  };

  const res = await fetch(
    `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  return data;
}

/**
 * Validate M-Pesa callback signature
 * 
 * Ensures callback is genuinely from Safaricom
 */
export function validateCallback(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', process.env.MPESA_CONSUMER_SECRET || '')
    .update(body)
    .digest('base64');

  return hash === signature;
}

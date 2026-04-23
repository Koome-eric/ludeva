// src/lib/actions/stkPush.ts

import axios from "axios";

const baseURL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await axios.get(
    `${baseURL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return res.data.access_token;
}

export async function sendStkPush({
  mpesa_number,
  amount,
}: {
  mpesa_number: string;
  amount: number;
}) {
  try {
    const token = await getAccessToken();

    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const callback = process.env.MPESA_CALLBACK_URL!;

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64"
    );

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: mpesa_number,
      PartyB: shortcode,
      PhoneNumber: mpesa_number,
      CallBackURL: callback,
      AccountReference: "Investment",
      TransactionDesc: "Investment Deposit",
    };

    const res = await axios.post(
      `${baseURL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: res.data,
    };
  } catch (error: any) {
    console.error("STK Push Error:", error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}
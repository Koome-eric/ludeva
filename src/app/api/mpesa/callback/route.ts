// src/app/api/mpesa/callback/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    console.log("MPESA CALLBACK:", JSON.stringify(body, null, 2));

    const callback = body.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "No callback"
      });
    }

    const checkoutId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;

    /*
    --------------------------------
    Find payment
    --------------------------------
    */

    const payment = await prisma.payment.findFirst({
      where: {
        providerReference: checkoutId
      }
    });

    if (!payment) {

      console.log("Payment not found");

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success"
      });

    }

    /*
    --------------------------------
    Prevent duplicate processing
    --------------------------------
    */

    if (payment.status === "SUCCESS") {

      console.log("Payment already processed");

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Already processed"
      });

    }

    /*
    --------------------------------
    If payment failed
    --------------------------------
    */

    if (resultCode !== 0) {

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" }
      });

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success"
      });

    }

    /*
    --------------------------------
    Extract receipt
    --------------------------------
    */

    const metadata = callback.CallbackMetadata?.Item || [];

    const receiptItem = metadata.find(
      (i: any) => i.Name === "MpesaReceiptNumber"
    );

    const receipt = receiptItem?.Value;

    /*
    --------------------------------
    Update payment
    --------------------------------
    */

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        reference: receipt || payment.reference
      }
    });

    /*
    --------------------------------
    Increase investment amount
    --------------------------------
    */

    if (payment.investmentId) {

      await prisma.investment.update({
        where: { id: payment.investmentId },
        data: {
          amount: {
            increment: payment.amount
          },
          status: "ACTIVE"
        }
      });

    }

    /*
    --------------------------------
    Transaction ledger
    --------------------------------
    */

    await prisma.transaction.create({
      data: {
        userId: payment.userId,
        type: "INVESTMENT",
        amount: payment.amount,
        status: "SUCCESS"
      }
    });

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success"
    });

  } catch (err) {

    console.error("MPESA CALLBACK ERROR:", err);

    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Failed" },
      { status: 500 }
    );

  }

}
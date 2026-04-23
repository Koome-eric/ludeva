import { prisma } from "@/lib/prisma";
import { sendStkPush } from "@/lib/actions/stkPush";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {

    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
      });
    }

    const body = await req.json();
    const { investmentId, amount, phone } = body;

    if (!investmentId || !amount || !phone) {
      return NextResponse.json({
        success: false,
        error: "Missing fields",
      });
    }

    /*
    --------------------------------
    Find user
    --------------------------------
    */

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      });
    }

    /*
    --------------------------------
    Get EXISTING investment
    --------------------------------
    */

    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment) {
      return NextResponse.json({
        success: false,
        error: "Investment not found",
      });
    }

    /*
    --------------------------------
    Send STK Push
    --------------------------------
    */

    const stk = await sendStkPush({
      mpesa_number: phone,
      amount,
    });

    if (!stk.success) {
      return NextResponse.json({
        success: false,
        error: "STK push failed",
      });
    }

    /*
    --------------------------------
    Save payment record
    --------------------------------
    */

    await prisma.payment.create({
      data: {
        userId: user.id,
        investmentId: investment.id,

        amount,
        method: "MPESA",

        reference: crypto.randomUUID(),

        providerReference: stk.data.CheckoutRequestID,
        merchantRequestID: stk.data.MerchantRequestID,

        status: "PROCESSING",

        description: "Investment top-up",
      },
    });

    return NextResponse.json({
      success: true,
      requestId: stk.data.CheckoutRequestID,
    });

  } catch (error) {

    console.error("Investment deposit error:", error);

    return NextResponse.json({
      success: false,
      error: "Server error",
    });

  }
}
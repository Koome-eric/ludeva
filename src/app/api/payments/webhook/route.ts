import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { reference, status, providerReference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Missing payment reference" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { investment: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // ------------------ UPDATE PAYMENT ------------------
    const updatedPayment = await prisma.payment.update({
      where: { reference },
      data: {
        status: status === "SUCCESS" ? "SUCCESS" : "FAILED",
        providerReference: providerReference ?? null,
      },
    });

    // ------------------ ACTIVATE INVESTMENT ------------------
    if (status === "SUCCESS" && payment.investmentId) {
      await prisma.investment.update({
        where: { id: payment.investmentId },
        data: {
          status: "ACTIVE",
        },
      });

      await prisma.transaction.create({
        data: {
          userId: payment.userId,
          type: "DEPOSIT",
          amount: payment.amount,
          status: "SUCCESS",
        },
      });

      await notifyUser(
        payment.userId,
        "Investment Activated",
        `Your investment of KES ${payment.amount} has been successfully processed.`,
        "PAYMENT"
      );
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
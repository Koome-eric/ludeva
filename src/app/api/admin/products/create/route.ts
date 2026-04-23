import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAllMembers } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const product = await prisma.investmentProduct.create({
      data: {
        name: body.name,
        roi: body.roi,
        duration: body.duration,
        minAmount: body.minAmount,
        category: body.category,
      },
    });

    // ✅ Trigger Notification
    await notifyAllMembers(
      "New Investment Opportunity",
      `${product.name} is now available for investment.`,
      "INVESTMENT"
    );

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
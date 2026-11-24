import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModuleApi } from "@/lib/auth-guard";
import { notifyAllMembers } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const { error: accessError } = await requireModuleApi("products", "edit");
  if (accessError) return accessError;
  try {
    const { id } = await req.json();

    const product = await prisma.investmentProduct.delete({
      where: { id },
    });

    await notifyAllMembers(
      "Investment Product Removed",
      `${product.name} is no longer available.`,
      "INVESTMENT"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
// src/app/api/investment-products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAllMembers } from "@/lib/notifications";

declare global {
  var io: any;
}

// ------------------ GET ALL PRODUCTS ------------------
export async function GET() {
  try {
    const products = await prisma.investmentProduct.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// ------------------ CREATE PRODUCT ------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.category || !body.type) {
      return NextResponse.json(
        { error: "Name, category & type are required" },
        { status: 400 }
      );
    }

    const product = await prisma.investmentProduct.create({
      data: {
        name: body.name,
        category: body.category, // ProductCategory enum
        type: body.type,         // FundType enum: MMF | STOCK | BOND
        roi: Number(body.roi) || 0,
        duration: Number(body.duration) || 30,
        minAmount: Number(body.minAmount) || 0,
        maxAmount: body.maxAmount ? Number(body.maxAmount) : undefined,
        nav: body.nav !== undefined ? Number(body.nav) : null,
        inceptionDate: body.inceptionDate ? new Date(body.inceptionDate) : null,
        isActive: body.isActive ?? true,
        activeInvestors: 0,
      },
    });

    // ⚡ Emit real-time event
    if (globalThis.io) globalThis.io.emit("product:update", product);

    // ⚡ Notify members
    await notifyAllMembers(
      "New Investment Product Added",
      `${product.name} is now available for investment.`,
      "INVESTMENT"
    );

    return NextResponse.json(product);
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
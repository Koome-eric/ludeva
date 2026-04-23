import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAllMembers } from "@/lib/notifications";

declare global {
  var io: any;
}

type Params = { params: { id: string } };

/* ------------------ GET SINGLE PRODUCT ------------------ */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params; // ✅ don't await this
    if (!id) return NextResponse.json({ error: "Product ID missing" }, { status: 400 });

    const product = await prisma.investmentProduct.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (err) {
    console.error("GET SINGLE PRODUCT ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

/* ------------------ UPDATE PRODUCT ------------------ */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: "Product ID missing" }, { status: 400 });

    const body = await req.json();

    const updatedProduct = await prisma.investmentProduct.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        type: body.type,
        roi: Number(body.roi),
        duration: Number(body.duration),
        minAmount: Number(body.minAmount),
        maxAmount: body.maxAmount ? Number(body.maxAmount) : undefined,
        nav: body.nav !== undefined ? Number(body.nav) : null,
        inceptionDate: body.inceptionDate ? new Date(body.inceptionDate) : null,
        isActive: Boolean(body.isActive),
      },
    });

    if (globalThis.io) globalThis.io.emit("product:update", updatedProduct);

    await notifyAllMembers(
      "Investment Product Updated",
      `${updatedProduct.name} has been updated.`,
      "INVESTMENT"
    );

    return NextResponse.json(updatedProduct);
  } catch (err) {
    console.error("PUT ERROR:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

/* ------------------ DELETE PRODUCT ------------------ */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ error: "Product ID missing" }, { status: 400 });

    const deletedProduct = await prisma.investmentProduct.delete({ where: { id } });

    if (globalThis.io) globalThis.io.emit("product:delete", deletedProduct);

    await notifyAllMembers(
      "Investment Product Removed",
      `The investment product "${deletedProduct.name}" has been removed.`,
      "INVESTMENT"
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
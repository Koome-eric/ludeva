import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDB } from "@/lib/user";
import { notifyAdmin } from "@/lib/notifications";

declare global {
  var io: any;
}

function mapCategoryToFundType(category: string) {
  switch (category) {
    case "MONEY_MARKET":
      return "MMF";
    case "EQUITY":
      return "STOCK";
    case "FIXED_INCOME":
      return "BOND";
    default:
      return "MMF";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, amount } = body;

    if (!productId || !amount) {
      return NextResponse.json(
        { error: "Product ID and amount are required" },
        { status: 400 }
      );
    }

    const user = await getCurrentUserFromDB();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.investmentProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Prevent investments into Bond / Fixed Income products — bonds removed platform-wide
    if (product.type === 'BOND' || product.category === 'FIXED_INCOME') {
      return NextResponse.json({ error: 'Investments in bonds are no longer supported' }, { status: 400 });
    }

    if (amount < product.minAmount) {
      return NextResponse.json(
        { error: `Minimum investment is KES ${product.minAmount}` },
        { status: 400 }
      );
    }

    const fundType = mapCategoryToFundType(product.category);

    /* ---------------------------------- */
    /* 1️⃣ Create Investment               */
    /* ---------------------------------- */

    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        productId: product.id,

        productName: product.name,
        roi: product.roi,
        duration: product.duration,

        amount: Math.round(amount),

        fundType: fundType as any,

        status: "ACTIVE",
      },
    });

    /* ---------------------------------- */
    /* 2️⃣ Ledger Transaction              */
    /* ---------------------------------- */

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "INVESTMENT",
        amount: Math.round(amount),
        status: "SUCCESS",
      },
    });

    /* ---------------------------------- */
    /* 3️⃣ Update Product Stats            */
    /* ---------------------------------- */

    await prisma.investmentProduct.update({
      where: { id: productId },
      data: {
        activeInvestors: (product.activeInvestors || 0) + 1,
      },
    });

    /* ---------------------------------- */
    /* 4️⃣ Notify Admin                    */
    /* ---------------------------------- */

    await notifyAdmin(
      "New Investment Created",
      `${user.fullName || user.email} invested KES ${investment.amount} in ${product.name}`,
      "INVESTMENT"
    );

    /* ---------------------------------- */
    /* 5️⃣ Live Dashboard Updates          */
    /* ---------------------------------- */

    if (globalThis.io) {
      globalThis.io.emit("investment:new", {
        userName: user.fullName || user.email,
        productName: product.name,
        amount: investment.amount,
      });

      globalThis.io.emit("transaction:new", {
        userId: user.id,
      });
    }

    return NextResponse.json(investment);
  } catch (err) {
    console.error("POST INVESTMENT ERROR:", err);

    return NextResponse.json(
      { error: "Failed to create investment" },
      { status: 500 }
    );
  }
}
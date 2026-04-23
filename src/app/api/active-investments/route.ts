import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDB } from "@/lib/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUserFromDB();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        productName: true,
        amount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ investments });

  } catch (error) {
    console.error("ACTIVE INVESTMENTS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: 500 }
    );
  }
}
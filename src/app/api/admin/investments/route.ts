import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: "desc" },

      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(investments);

  } catch (err) {
    console.error("Fetch investments error:", err);

    return NextResponse.json(
      { error: "Failed to fetch investments" },
      { status: 500 }
    );
  }
}
// src/app/api/admins/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" }, // Only fetch admins
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        kycStatus: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    });

    const formattedAdmins = admins.map(admin => ({
      id: admin.id,
      name: admin.fullName || "N/A",
      email: admin.email,
      role: admin.role === "ADMIN" ? "Admin" : admin.role,
      status: admin.onboardingCompleted ? "Active" : "Inactive",
    }));

    return NextResponse.json(formattedAdmins);
  } catch (err) {
    console.error("Failed to fetch admins:", err);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}
// src/app/api/admins/[id]/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await req.json();
    const { role, onboardingCompleted } = body;

    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: {
        role,
        onboardingCompleted,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      id: updatedAdmin.id,
      name: updatedAdmin.fullName,
      email: updatedAdmin.email,
      role: updatedAdmin.role === "ADMIN" ? "Admin" : updatedAdmin.role,
      status: updatedAdmin.onboardingCompleted ? "Active" : "Inactive",
    });
  } catch (err) {
    console.error("Failed to update admin:", err);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}
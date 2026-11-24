// src/app/api/admins/[id]/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApi } from "@/lib/auth-guard";

// Legacy endpoint (nothing in the app calls it). It used to have NO auth check,
// so any signed-in user could change any user's role — including making
// themselves ADMIN. Now super admin only.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdminApi();
  if (error) return error;

  const { id } = await params;

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
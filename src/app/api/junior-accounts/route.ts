import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromDB } from "@/lib/user";
import { notifyAdmin } from "@/lib/notifications";

// ------------------ GET: the signed-in guardian's own applications ------------------
export async function GET() {
  try {
    const user = await getCurrentUserFromDB();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const applications = await prisma.juniorAccountApplication.findMany({
      where: { guardianId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (err) {
    console.error("GET JUNIOR ACCOUNTS ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

// ------------------ POST: submit a new application ------------------
// Files are uploaded client-side first via /api/upload-kyc-doc (same R2
// pipeline as adult KYC), so this route only receives the resulting URLs.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromDB();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      childFullName,
      childDateOfBirth,
      guardianIdNumber,
      guardianPhone,
      guardianKraPin,
      birthCertUrl,
      childPhotoUrl,
    } = body;

    if (!childFullName?.trim()) {
      return NextResponse.json({ error: "Child's full name is required" }, { status: 400 });
    }
    if (!guardianIdNumber?.trim()) {
      return NextResponse.json({ error: "Your ID/passport number is required" }, { status: 400 });
    }
    if (!guardianPhone?.trim()) {
      return NextResponse.json({ error: "Your phone number is required" }, { status: 400 });
    }
    if (!guardianKraPin?.trim()) {
      return NextResponse.json({ error: "Your KRA PIN is required" }, { status: 400 });
    }
    if (!birthCertUrl) {
      return NextResponse.json({ error: "Upload the child's birth certificate" }, { status: 400 });
    }
    if (!childPhotoUrl) {
      return NextResponse.json({ error: "Upload the child's passport photo" }, { status: 400 });
    }

    const application = await prisma.juniorAccountApplication.create({
      data: {
        guardianId: user.id,
        childFullName: childFullName.trim(),
        childDateOfBirth: childDateOfBirth ? new Date(childDateOfBirth) : undefined,
        guardianIdNumber: guardianIdNumber.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianKraPin: guardianKraPin.trim(),
        birthCertUrl,
        childPhotoUrl,
      },
    });

    await notifyAdmin(
      "New Ludeva Junior Account application",
      `${user.fullName || user.email} applied for a Junior Account for ${application.childFullName}.`,
      "KYC"
    );

    return NextResponse.json(application);
  } catch (err) {
    console.error("POST JUNIOR ACCOUNT ERROR:", err);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}

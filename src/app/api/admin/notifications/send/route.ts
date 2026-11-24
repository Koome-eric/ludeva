import { NextRequest, NextResponse } from "next/server";
import { notifyAllMembers } from "@/lib/notifications";
import { requireModuleApi } from "@/lib/auth-guard";

export async function POST(req: NextRequest) {
  const { error: accessError } = await requireModuleApi("content", "edit");
  if (accessError) return accessError;
  try {
    const body = await req.json();

    await notifyAllMembers(
      body.title,
      body.message,
      "SYSTEM"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
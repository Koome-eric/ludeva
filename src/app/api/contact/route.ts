import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const departmentEmails: Record<string, string> = {
  general: "info@ludevaplc.co.ke",
  consultation: "keziahodemba@ludevaplc.co.ke",
  investment: "invest@ludevaplc.co.ke",
};

export async function POST(req: Request) {
  try {
    // ✅ Check API key
    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const { name, email, phone, message, department } = body;

    // ✅ Basic validation
    if (!name || !email || !message || !department) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const recipient = departmentEmails[department];

    if (!recipient) {
      return NextResponse.json(
        { error: "Invalid department" },
        { status: 400 }
      );
    }

    console.log("📩 Sending email to:", recipient);

    const response = await resend.emails.send({
      // ⚠️ IMPORTANT: Use Resend default sender (works instantly)
      from: "Ludeva <noreply@ludevaplc.co.ke>",
      to: [recipient],
      subject: `New ${department} inquiry from ${name}`,
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>

        <p><strong>Department:</strong> ${department}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>

        <h3>Message</h3>
        <p>${message}</p>
      `,
    });

    console.log("✅ Resend response:", response);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ EMAIL ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
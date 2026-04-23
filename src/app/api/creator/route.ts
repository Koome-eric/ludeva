import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB (Resend attachment limit)
const MAX_VIDEO_DURATION_SECONDS = 60;

export async function POST(req: Request) {
  console.log("API hit: /api/creator");

  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // ── Parse multipart form data ────────────────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    const name        = formData.get("name")        as string | null;
    const stageName   = formData.get("stageName")   as string | null;
    const idNumber    = formData.get("idNumber")    as string | null;
    const phone       = formData.get("phone")       as string | null;
    const email       = formData.get("email")       as string | null;
    const category    = formData.get("category")    as string | null;
    const portfolio   = formData.get("portfolio")   as string | null;
    const description = formData.get("description") as string | null;
    const videoFile   = formData.get("video")       as File | null;
    const videoDuration = formData.get("videoDuration") as string | null;

    console.log("Form fields received:", { name, stageName, email, category });

    // ── Validation ───────────────────────────────────────────
    if (!name || !stageName || !idNumber || !phone || !email || !category || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Video validation (server-side) ───────────────────────
    let videoAttachment: { filename: string; content: Buffer } | null = null;

    if (videoFile && videoFile.size > 0) {
      // Size guard
      if (videoFile.size > MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Video must be under ${MAX_VIDEO_SIZE_BYTES / 1024 / 1024} MB` },
          { status: 400 }
        );
      }

      // Duration guard — client sends the duration it measured
      const duration = parseFloat(videoDuration ?? "0");
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        return NextResponse.json(
          { error: `Video must be 60 seconds or under (received ${Math.round(duration)}s)` },
          { status: 400 }
        );
      }

      const arrayBuffer = await videoFile.arrayBuffer();
      videoAttachment = {
        filename: videoFile.name || "sample-video.mp4",
        content: Buffer.from(arrayBuffer),
      };
    }

    console.log("📩 Sending creator email…", videoAttachment ? "with video attachment" : "no video");

    // ── Build email ──────────────────────────────────────────
    const emailPayload: Parameters<typeof resend.emails.send>[0] = {
      from: "Ludeva Creators <creator@ludevaplc.co.ke>",
      to: ["creator@ludevaplc.co.ke"],
      replyTo: email,
      subject: `🎬 New Creator Application — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px;">
          <h2 style="color:#111;">New Creator Application</h2>
          <hr style="margin:20px 0;" />

          <h3>👤 Personal Information</h3>
          <p><strong>Full Name:</strong> ${name}</p>
          <p><strong>Stage Name:</strong> ${stageName}</p>
          <p><strong>ID Number:</strong> ${idNumber}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>

          <hr style="margin:20px 0;" />

          <h3>🎯 Content Details</h3>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Portfolio:</strong> ${
            portfolio
              ? `<a href="${portfolio}" target="_blank">${portfolio}</a>`
              : "N/A"
          }</p>
          <p><strong>Description:</strong></p>
          <p style="background:#f5f5f5; padding:10px; border-radius:8px;">${description}</p>

          <hr style="margin:20px 0;" />

          ${
            videoAttachment
              ? `<p>🎥 <strong>Sample video attached:</strong> ${videoAttachment.filename} (${
                  videoDuration ? `${videoDuration}s` : "duration unknown"
                })</p>`
              : "<p>📎 No sample video submitted.</p>"
          }

          <hr style="margin:20px 0;" />
          <p style="font-size:12px; color:#888;">Submitted via Ludeva Creator Platform</p>
        </div>
      `,
      ...(videoAttachment
        ? {
            attachments: [
              {
                filename: videoAttachment.filename,
                content: videoAttachment.content,
              },
            ],
          }
        : {}),
    };

    const response = await resend.emails.send(emailPayload);
    console.log("✅ Resend response:", response);

    if ((response as any)?.error) {
      throw new Error((response as any).error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error sending email:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// Next.js 14 App Router: disable body size limit for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
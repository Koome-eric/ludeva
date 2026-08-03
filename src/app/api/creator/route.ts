import { NextResponse } from "next/server";
import { Resend } from "resend";
import { uploadBufferToR2, isR2Configured } from "@/lib/r2";

const resend = new Resend(process.env.RESEND_API_KEY);

// Bumped alongside the 90s duration limit (a 90s clip is roughly 1.5x the
// bytes of a 60s clip at the same bitrate) so raising the duration limit
// doesn't quietly reintroduce upload failures for otherwise-valid videos.
const MAX_VIDEO_SIZE_BYTES = 75 * 1024 * 1024; // 75 MB
const MAX_VIDEO_DURATION_SECONDS = 90; // 1 minute 30 seconds

export const dynamic = "force-dynamic";

// App Router body size limit (replaces the old Pages Router config export)
export const maxDuration = 60;

export async function POST(req: Request) {
  console.log("API hit: /api/creator");

  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e) {
      console.error("formData parse error:", e);
      return NextResponse.json(
        { error: "Invalid form data — could not parse request body" },
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

    if (!name || !stageName || !idNumber || !phone || !email || !category || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Video handling ──────────────────────────────────────
    // Videos are uploaded to Cloudflare R2 and linked in the email, rather
    // than attached to the email directly. Email providers (Resend included)
    // cap total message size well below what a real 60-90s video weighs —
    // that mismatch was the actual reason sample videos were failing to
    // "upload" before. Storing on R2 and linking also means the file stays
    // reviewable/downloadable after the fact, unlike a bounced attachment.
    let videoUrl: string | null = null;
    let videoSizeMB: string | null = null;

    if (videoFile && videoFile.size > 0) {
      if (videoFile.size > MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
          { error: `Video must be under ${Math.round(MAX_VIDEO_SIZE_BYTES / 1024 / 1024)} MB` },
          { status: 400 }
        );
      }

      const duration = parseFloat(videoDuration ?? "0");
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        return NextResponse.json(
          { error: `Video must be ${MAX_VIDEO_DURATION_SECONDS} seconds or under (received ${Math.round(duration)}s)` },
          { status: 400 }
        );
      }

      if (!isR2Configured()) {
        console.error("R2 not configured — cannot store creator sample video");
        return NextResponse.json(
          { error: "Video upload is temporarily unavailable. Please submit the form without a video, or email your sample video directly to creator@ludevaplc.co.ke." },
          { status: 500 }
        );
      }

      const arrayBuffer = await videoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = (videoFile.name || "sample-video.mp4").replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const key = `creator-applications/${Date.now()}-${safeName}`;

      videoUrl = await uploadBufferToR2(buffer, key, videoFile.type || "video/mp4");
      videoSizeMB = (videoFile.size / 1024 / 1024).toFixed(1);
    }

    console.log("Sending creator email…", videoUrl ? `with video link (${videoUrl})` : "no video");

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
            videoUrl
              ? `<p>🎥 <strong>Sample video:</strong> <a href="${videoUrl}" target="_blank">${videoUrl}</a> (${videoDuration ? `${videoDuration}s, ` : ""}${videoSizeMB} MB)</p>`
              : "<p>📎 No sample video submitted.</p>"
          }

          <hr style="margin:20px 0;" />
          <p style="font-size:12px; color:#888;">Submitted via Ludeva Creator Platform</p>
        </div>
      `,
    };

    const response = await resend.emails.send(emailPayload);
    console.log("Resend response:", response);

    if ((response as any)?.error) {
      throw new Error((response as any).error.message);
    }

    return NextResponse.json({ success: true, videoUrl });
  } catch (err: any) {
    console.error("Error sending email:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

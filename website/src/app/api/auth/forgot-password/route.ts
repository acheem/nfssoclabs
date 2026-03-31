import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Always return success to avoid leaking which emails exist
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ success: true });
  }

  // Delete any existing tokens for this email
  await db.passwordResetToken.deleteMany({ where: { email } });

  // Create new token, expires in 1 hour
  const token = await db.passwordResetToken.create({
    data: {
      email,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? process.env.AUTH_URL}/reset-password?token=${token.token}`;

  await resend.emails.send({
    from: "NFCSOC Labs <onboarding@resend.dev>",
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #22d3ee;">Reset your password</h2>
        <p>Hi ${user.name},</p>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#22d3ee;color:#0a0f1a;border-radius:8px;font-weight:600;text-decoration:none;">
          Reset password
        </a>
        <p style="color:#94a3b8;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#94a3b8;font-size:12px;">Or copy this link: ${resetUrl}</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}

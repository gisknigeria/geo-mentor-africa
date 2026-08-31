import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const { invitedEmail, invitedRole, token } = await request.json();

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "GeoMentor <onboarding@resend.dev>";
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!resendKey || !fromEmail) {
    return NextResponse.json({ error: "Email service is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel." }, { status: 503 });
  }

  const resend = new Resend(resendKey);
  const acceptUrl = `${origin.replace(/\/$/, "")}/invite?token=${encodeURIComponent(token)}`;
  const roleLabel = invitedRole === "SCHOOL_ADMIN" ? "School Administrator" : "Teacher";

  const { error: sendError } = await resend.emails.send({
    from: fromEmail,
    to: invitedEmail,
    subject: `You're invited to join GeoMentor as a ${roleLabel}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0b4436; margin: 0 0 16px 0; font-size: 24px;">School Staff Invitation</h2>
          <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.5;">You have been invited to join GeoMentor as a <strong>${roleLabel}</strong>.</p>
        </div>
        
        <div style="background: #f4f6f1; border: 1px solid #e0e7d8; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: bold;">Your one-time acceptance code:</p>
          <div style="background: white; border: 1px solid #d0d8cc; border-radius: 6px; padding: 16px; font-family: 'Monaco', 'Courier New', monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; text-align: center; color: #0b4436;">${token}</div>
        </div>

        <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; line-height: 1.5;">Or accept your invitation directly by clicking the link below:</p>
        <div style="margin-bottom: 24px;">
          <a href="${acceptUrl}" style="background: #0b4436; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 14px;">Accept invitation</a>
        </div>

        <div style="border-top: 1px solid #e0e7d8; padding-top: 16px; margin-top: 24px;">
          <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">This invitation expires in 30 days. If you did not expect this invitation or have questions, contact your school administrator.</p>
        </div>
      </div>
    `,
  });

  if (sendError) {
    console.error("Resend email error:", sendError);
    return NextResponse.json({ error: `Email delivery failed: ${sendError.message}` }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

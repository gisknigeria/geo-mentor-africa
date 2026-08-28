import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!supabaseUrl || !serviceRoleKey || !resendKey || !from || !token) return NextResponse.json({ error: "Email service is not configured" }, { status: 503 });

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: authData, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !authData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { data: adminMembership } = await adminClient.from("organization_memberships").select("user_id").eq("user_id", authData.user.id).eq("role", "PLATFORM_ADMIN").eq("status", "VERIFIED").maybeSingle();
  if (!adminMembership) return NextResponse.json({ error: "Platform administrator role required" }, { status: 403 });

  const body = await request.json().catch(() => null) as { applicationId?: string } | null;
  if (!body?.applicationId) return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
  const { data: application, error: applicationError } = await adminClient.from("registration_applications").select("applicant_user_id, application_type, organization_name, status").eq("id", body.applicationId).maybeSingle();
  if (applicationError || !application || application.status !== "VERIFIED" || application.application_type !== "SCHOOL") return NextResponse.json({ error: "Approved school application not found" }, { status: 404 });

  const { data: applicantData, error: applicantError } = await adminClient.auth.admin.getUserById(application.applicant_user_id);
  const email = applicantData.user?.email;
  if (applicantError || !email) return NextResponse.json({ error: "Applicant email not found" }, { status: 422 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resend = new Resend(resendKey);
  const { error: sendError } = await resend.emails.send({
    from,
    to: email,
    subject: "Your GeoMentor school has been approved",
    html: `<p>Your school application for <strong>${application.organization_name || "your school"}</strong> has been approved.</p><p>You can now sign in to GeoMentor Africa with the email address used for your application.</p><p><a href="${siteUrl}/auth">Open GeoMentor sign in</a></p><p>If you have not created a password yet, use the original verification email to set one.</p>`,
  });
  if (sendError) return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
  return NextResponse.json({ sent: true });
}

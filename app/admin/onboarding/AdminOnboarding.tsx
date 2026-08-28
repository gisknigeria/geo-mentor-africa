"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { CheckCircle2, Clipboard, KeyRound, School, ShieldAlert, UserPlus, Users } from "lucide-react";
import { Logo } from "../../../components/app/logo";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { supabase } from "../../../lib/supabase/client";

type Application = { id: string; application_type: string; organization_name: string | null; country_code: string; state_region: string; city: string; credentials_summary: string | null; motivation: string; status: string; created_at: string; reviewed_at?: string | null };
type StudentRequest = { id: string; school_id: string; student_display_name: string; guardian_name: string; guardian_email: string; consent_status: string; created_at: string };
type SchoolRecord = { id: string; organization_id: string; name: string; city: string | null };
type GeneratedAccess = { title: string; value: string; description: string };

function secureCode(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function AdminOnboarding() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [approvedApplications, setApprovedApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<StudentRequest[]>([]);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [generated, setGenerated] = useState<GeneratedAccess | null>(null);
  const [consentConfirmed, setConsentConfirmed] = useState<Record<string, boolean>>({});
  const [consentMethod, setConsentMethod] = useState<Record<string, string>>({});

  const loadQueues = useCallback(async () => {
    const [applicationResult, studentResult, schoolResult] = await Promise.all([
      supabase.from("registration_applications").select("id, application_type, organization_name, country_code, state_region, city, credentials_summary, motivation, status, created_at").eq("status", "PENDING").order("created_at"),
      supabase.from("student_join_requests").select("id, school_id, student_display_name, guardian_name, guardian_email, consent_status, created_at").eq("consent_status", "PENDING").order("created_at"),
      supabase.from("schools").select("id, organization_id, name, city").eq("verification_status", "VERIFIED").order("name"),
    ]);
    setApplications((applicationResult.data ?? []) as Application[]);
    const { data: approvedData } = await supabase.from("registration_applications").select("id, application_type, organization_name, country_code, state_region, city, credentials_summary, motivation, status, created_at, reviewed_at").eq("status", "VERIFIED").order("reviewed_at", { ascending: false });
    setApprovedApplications((approvedData ?? []) as Application[]);
    setStudents((studentResult.data ?? []) as StudentRequest[]);
    setSchools((schoolResult.data ?? []) as SchoolRecord[]);
    setSetupRequired(Boolean(applicationResult.error?.code === "42P01" || applicationResult.error?.code === "PGRST205"));
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: membership } = await supabase.from("organization_memberships").select("user_id").eq("user_id", data.user.id).eq("role", "PLATFORM_ADMIN").eq("status", "VERIFIED").maybeSingle();
        if (membership) {
          setIsAdmin(true);
          await loadQueues();
        }
      }
      setChecking(false);
    });
  }, [loadQueues]);

  async function reviewApplication(id: string, decision: "VERIFIED" | "REJECTED" | "NEEDS_CHANGES") {
    setBusyId(id);
    setMessage(null);
    const { error } = await supabase.rpc("review_registration_application", { application_id: id, review_decision: decision, notes: null });
    if (error) {
      setMessage("This action requires a verified platform administrator and the onboarding migrations.");
    } else if (decision === "VERIFIED" && applications.find((application) => application.id === id)?.application_type === "SCHOOL") {
      const { data: sessionData } = await supabase.auth.getSession();
      const emailResponse = await fetch("/api/notifications/school-approved", { method: "POST", headers: { Authorization: `Bearer ${sessionData.session?.access_token || ""}`, "Content-Type": "application/json" }, body: JSON.stringify({ applicationId: id }) });
      setMessage(emailResponse.ok ? "School approved and sign-in instructions emailed." : "School approved, but the notification email could not be sent. Contact the applicant manually.");
    } else {
      setMessage(`Application marked ${decision.toLowerCase().replace("_", " ")}.`);
    }
    if (!error) await loadQueues();
    setBusyId(null);
  }

  async function reviewStudent(id: string, decision: "VERIFIED" | "REJECTED" | "NEEDS_CHANGES") {
    if (decision === "VERIFIED" && !consentConfirmed[id]) { setMessage("Confirm that guardian or school consent has been verified before approving this student."); return; }
    setBusyId(id);
    setMessage(null);
    const { error } = await supabase.rpc("review_student_join_request", { request_id: id, review_decision: decision, consent_confirmed: Boolean(consentConfirmed[id]), consent_method: consentMethod[id] || "DIGITAL", notes: null });
    setMessage(error ? "The student request could not be reviewed. Confirm your school role and database setup." : `Student request marked ${decision.toLowerCase().replace("_", " ")}.`);
    if (!error) await loadQueues();
    setBusyId(null);
  }

  async function resendApprovalEmail(id: string) {
    setBusyId(`email-${id}`);
    const { data: sessionData } = await supabase.auth.getSession();
    const response = await fetch("/api/notifications/school-approved", { method: "POST", headers: { Authorization: `Bearer ${sessionData.session?.access_token || ""}`, "Content-Type": "application/json" }, body: JSON.stringify({ applicationId: id }) });
    setMessage(response.ok ? "Confirmation email sent again." : "The confirmation email could not be sent. Check the email configuration.");
    setBusyId(null);
  }

  async function createClassCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const schoolId = String(values.get("schoolId") || "");
    const code = `GMA-${secureCode(10)}`;
    const days = Number(values.get("validDays") || 30);
    const expiry = new Date(Date.now() + days * 86400000).toISOString();
    setBusyId("class-code");
    const { error } = await supabase.rpc("create_class_join_code", { target_school: schoolId, plain_code: code, code_label: String(values.get("label") || "Pilot class"), valid_until: expiry, allowed_uses: Number(values.get("maxUses") || 40) });
    if (error) setMessage("Class code could not be created. Confirm that you are a verified school administrator.");
    else setGenerated({ title: "Class code created", value: code, description: "Share this only with the supervised class. It will not be shown again." });
    setBusyId(null);
  }

  async function createStaffInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const token = secureCode(32);
    const expiry = new Date(Date.now() + 7 * 86400000).toISOString();
    setBusyId("staff-invite");
    const { error } = await supabase.rpc("create_staff_invitation", { target_school: String(values.get("schoolId") || ""), invite_email: String(values.get("email") || ""), invite_role: String(values.get("role") || "TEACHER"), plain_token: token, valid_until: expiry });
    if (error) setMessage("Staff invitation could not be created. Confirm the email, school and your administrator role.");
    else setGenerated({ title: "Staff invitation created", value: token, description: "Send this one-time code to the invited staff member, who can accept it on the staff invitation page." });
    setBusyId(null);
  }

  if (checking) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm text-emerald-950">Loading onboarding workspace…</main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">Administrator sign-in required</h1><p className="mt-3 text-sm text-slate-600">Use your verified GeoMentor Africa administrator email.</p><Link href="/auth" className="mt-5 inline-block text-sm font-bold text-emerald-800">Sign in securely</Link></section></main>;
  if (!isAdmin) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-10 text-rose-700" /><p className="mt-5 text-[10px] font-black tracking-[.18em] text-rose-700">ACCESS NOT GRANTED</p><h1 className="mt-2 font-serif text-3xl text-emerald-950">This is not an administrator account.</h1><p className="mt-3 text-sm leading-6 text-slate-600">You are signed in as <strong>{user.email}</strong>, but this account does not have a verified Platform Administrator role.</p><Link href="/portal" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#0b4436] px-5 text-xs font-bold text-white">Return to my portal</Link></section></main>;

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]"><header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Logo /><div className="flex items-center gap-3"><span className="rounded-full bg-rose-100 px-3 py-1.5 text-[10px] font-black text-rose-800">PLATFORM ADMINISTRATOR</span><div className="hidden text-right sm:block"><p className="text-xs font-bold text-emerald-900">Admin account verified</p><p className="text-[10px] text-slate-400">{user.email}</p></div></div></div></header><div className="mx-auto max-w-7xl px-4 py-8 sm:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold tracking-[.18em] text-emerald-700">SECURE PILOT OPERATIONS</p><h1 className="mt-2 font-serif text-4xl text-emerald-950 sm:text-5xl">Review and activate access.</h1><p className="mt-2 text-sm text-slate-500">You are signed in as the platform administrator. Every approval creates a controlled, auditable access decision.</p></div><Link href="/portal" className="text-xs font-bold text-emerald-800">← Return to my portal</Link></div>
  <section className="mt-6 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:grid-cols-3"><div><span className="text-[10px] font-black text-emerald-700">1 · REVIEW</span><strong className="mt-1 block text-sm text-emerald-950">Check applications</strong><p className="mt-1 text-xs leading-5 text-slate-600">Verify schools, mentors and experts before approving access.</p></div><div><span className="text-[10px] font-black text-emerald-700">2 · ACTIVATE</span><strong className="mt-1 block text-sm text-emerald-950">Prepare the school</strong><p className="mt-1 text-xs leading-5 text-slate-600">Create supervised class codes only after consent and safeguarding readiness.</p></div><div><span className="text-[10px] font-black text-emerald-700">3 · INVITE</span><strong className="mt-1 block text-sm text-emerald-950">Add trusted staff</strong><p className="mt-1 text-xs leading-5 text-slate-600">Issue email-bound invitations to teachers and school administrators.</p></div></section>
  {setupRequired && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Database activation required.</strong> Apply migrations 0001–0004 in Supabase before using this workspace.</div>}
  {message && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{message}</div>}
  {generated && <div className="mt-5 flex flex-col gap-4 rounded-xl border border-lime-200 bg-lime-50 p-5 sm:flex-row sm:items-center"><KeyRound className="size-7 text-emerald-700" /><div className="min-w-0 flex-1"><strong className="text-sm">{generated.title}</strong><code className="mt-2 block break-all rounded-lg bg-white px-3 py-2 font-mono text-sm font-black tracking-wider text-emerald-950">{generated.value}</code><p className="mt-2 text-xs text-slate-600">{generated.description}</p></div><Button type="button" variant="secondary" onClick={() => void navigator.clipboard.writeText(generated.value)}><Clipboard className="size-4" />Copy</Button></div>}
  <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><Tabs defaultValue="applications"><TabsList className="gap-6 overflow-x-auto"><TabsTrigger value="applications">Pending ({applications.length})</TabsTrigger><TabsTrigger value="approved">Approved ({approvedApplications.length})</TabsTrigger><TabsTrigger value="students">Student consent ({students.length})</TabsTrigger><TabsTrigger value="codes">Class codes</TabsTrigger><TabsTrigger value="staff">Staff invitations</TabsTrigger></TabsList>
  <TabsContent value="applications" className="mt-5"><div className="mb-4 flex items-center gap-3"><Users className="size-5 text-emerald-700" /><div><h2 className="font-serif text-2xl text-emerald-950">School, mentor and expert applications</h2><p className="text-xs text-slate-500">Visible only to platform administrators.</p></div></div><div className="grid gap-4">{applications.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No pending applications are visible to this account.</p> : applications.map((application) => <article key={application.id} className="rounded-xl border border-slate-200 p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-800">{application.application_type}</span><h3 className="mt-3 text-lg font-bold text-emerald-950">{application.organization_name || `${application.application_type.toLowerCase()} applicant`}</h3><p className="mt-1 text-xs text-slate-500">{application.city}, {application.state_region} · {application.country_code}</p><p className="mt-3 max-w-3xl text-xs leading-5 text-slate-600">{application.credentials_summary || application.motivation}</p></div><div className="flex shrink-0 flex-wrap items-start gap-2"><Button size="sm" onClick={() => void reviewApplication(application.id, "VERIFIED")} disabled={busyId === application.id}><CheckCircle2 className="size-4" />Approve</Button><Button size="sm" variant="secondary" onClick={() => void reviewApplication(application.id, "NEEDS_CHANGES")} disabled={busyId === application.id}>Request changes</Button><Button size="sm" variant="ghost" onClick={() => void reviewApplication(application.id, "REJECTED")} disabled={busyId === application.id}>Reject</Button></div></div></article>)}</div></TabsContent>
  <TabsContent value="approved" className="mt-5"><div className="mb-4 flex items-center gap-3"><CheckCircle2 className="size-5 text-emerald-700" /><div><h2 className="font-serif text-2xl text-emerald-950">Approved participants</h2><p className="text-xs text-slate-500">A record of trusted school, mentor and expert access decisions.</p></div></div><div className="grid gap-4">{approvedApplications.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No approved applications are visible yet.</p> : approvedApplications.map((application) => <article key={application.id} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-5 sm:flex-row sm:items-center"><div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-800">{application.application_type}</span><h3 className="mt-3 text-lg font-bold text-emerald-950">{application.organization_name || `${application.application_type.toLowerCase()} applicant`}</h3><p className="mt-1 text-xs text-slate-500">{application.city}, {application.state_region} · Approved {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : "recorded"}</p></div>{application.application_type === "SCHOOL" && <Button size="sm" variant="secondary" onClick={() => void resendApprovalEmail(application.id)} disabled={busyId === `email-${application.id}`}>Resend confirmation email</Button>}</article>)}</div></TabsContent>
  <TabsContent value="students" className="mt-5"><div className="mb-4 flex items-center gap-3"><School className="size-5 text-emerald-700" /><div><h2 className="font-serif text-2xl text-emerald-950">Pending students and consent</h2><p className="text-xs text-slate-500">Teachers must verify the student and evidence of consent.</p></div></div><div className="grid gap-4">{students.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No pending student requests are visible to this account.</p> : students.map((student) => <article key={student.id} className="rounded-xl border border-slate-200 p-5"><div className="grid gap-5 lg:grid-cols-[1fr_auto]"><div><h3 className="text-lg font-bold text-emerald-950">{student.student_display_name}</h3><p className="mt-1 text-xs text-slate-500">Guardian: {student.guardian_name} · {student.guardian_email}</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={Boolean(consentConfirmed[student.id])} onChange={(event) => setConsentConfirmed((current) => ({ ...current, [student.id]: event.target.checked }))} className="size-4 accent-emerald-700" />I verified valid consent</label><select value={consentMethod[student.id] || "DIGITAL"} onChange={(event) => setConsentMethod((current) => ({ ...current, [student.id]: event.target.value }))} className="min-h-9 rounded-lg border border-slate-300 px-2 text-xs"><option value="DIGITAL">Digital consent</option><option value="PAPER">Paper consent</option><option value="SCHOOL_AUTHORITY">School authority</option></select></div></div><div className="flex flex-wrap items-start gap-2"><Button size="sm" onClick={() => void reviewStudent(student.id, "VERIFIED")} disabled={busyId === student.id}>Approve student</Button><Button size="sm" variant="secondary" onClick={() => void reviewStudent(student.id, "NEEDS_CHANGES")} disabled={busyId === student.id}>Needs changes</Button><Button size="sm" variant="ghost" onClick={() => void reviewStudent(student.id, "REJECTED")} disabled={busyId === student.id}>Reject</Button></div></div></article>)}</div></TabsContent>
  <TabsContent value="codes" className="mt-5"><div className="mb-5 flex items-center gap-3"><KeyRound className="size-5 text-emerald-700" /><div><h2 className="font-serif text-2xl text-emerald-950">Create a supervised class code</h2><p className="text-xs text-slate-500">Codes are hashed, expire automatically and have a usage limit.</p></div></div><form onSubmit={createClassCode} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="grid gap-2 text-xs font-bold"><span>School</span><select name="schoolId" required className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-normal"><option value="">Select school</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label><label className="grid gap-2 text-xs font-bold"><span>Class or club label</span><input name="label" required minLength={2} maxLength={80} placeholder="Green Club 2026" className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold"><span>Valid for</span><select name="validDays" className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-normal"><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></label><label className="grid gap-2 text-xs font-bold"><span>Maximum students</span><input name="maxUses" type="number" min="1" max="500" defaultValue="40" className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-normal" /></label><Button type="submit" className="sm:col-span-2 lg:col-span-4" disabled={busyId === "class-code"}>Generate secure class code</Button></form></TabsContent>
  <TabsContent value="staff" className="mt-5"><div className="mb-5 flex items-center gap-3"><UserPlus className="size-5 text-emerald-700" /><div><h2 className="font-serif text-2xl text-emerald-950">Invite a teacher or administrator</h2><p className="text-xs text-slate-500">The one-time code works only with the specified verified email.</p></div></div><form onSubmit={createStaffInvite} className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold"><span>School</span><select name="schoolId" required className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-normal"><option value="">Select school</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label><label className="grid gap-2 text-xs font-bold"><span>Verified email</span><input name="email" type="email" required className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold"><span>Role</span><select name="role" className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm font-normal"><option value="TEACHER">Teacher</option><option value="SCHOOL_ADMIN">School administrator</option></select></label><div className="flex items-end"><Button type="submit" className="w-full" disabled={busyId === "staff-invite"}>Create one-time invitation</Button></div></form><Link href="/invite" className="mt-5 inline-block text-xs font-bold text-emerald-800">Open staff invitation acceptance →</Link></TabsContent>
  </Tabs></section></div></main>;
}

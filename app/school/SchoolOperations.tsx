"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, CheckCircle2, ClipboardCheck, FolderKanban, Leaf, MapPin, ShieldAlert, UserCheck, Users } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { AccountMenu } from "../../components/app/account-menu";
import { supabase } from "../../lib/supabase/client";
import { decodeGeometry } from "../../lib/geo";

type Observation = { id: string; observation_type: string; common_name: string | null; scientific_name: string | null; verification_status: string; review_stage: string; observed_at: string; sensitivity_level: string; latitude: number | null; longitude: number | null };
type Dashboard = { school: { id: string; name: string; country_code: string }; role: string; metrics: { verified_students: number; pending_students: number; teacher_review: number; expert_review: number; verified_observations: number; active_projects: number }; recent_observations: Observation[] };
type StaffInvite = { id: string; email: string; role: string; status: string; expires_at: string; created_at: string };
type ClassJoinCode = { id: string; label: string; code_hint: string; expires_at: string; max_uses: number; use_count: number; active: boolean; created_at: string };
type StudentJoinRequest = { id: string; student_display_name: string; guardian_name: string; guardian_email: string; consent_status: string; created_at: string };

const stageLabel: Record<string, string> = { TEACHER_REVIEW: "Teacher review", EXPERT_REVIEW: "Expert review", STUDENT_REVISION: "Student revision", CLOSED: "Closed" };

function randomCode(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(length);
  const bytes = typeof crypto !== "undefined" ? crypto.getRandomValues(values) : values;
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

export function SchoolOperations() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [staffInvites, setStaffInvites] = useState<StaffInvite[]>([]);
  const [classCodes, setClassCodes] = useState<ClassJoinCode[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentJoinRequest[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"SCHOOL_ADMIN" | "TEACHER">("TEACHER");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [generatedInviteToken, setGeneratedInviteToken] = useState<string | null>(null);
  const [codeLabel, setCodeLabel] = useState("Class code");
  const [codeUses, setCodeUses] = useState(40);
  const [codeExpiryDays, setCodeExpiryDays] = useState(30);
  const [codeMessage, setCodeMessage] = useState<string | null>(null);
  const [generatedClassCode, setGeneratedClassCode] = useState<string | null>(null);
  const [busyStudentId, setBusyStudentId] = useState<string | null>(null);
  const [studentMessage, setStudentMessage] = useState<string | null>(null);
  const [consentConfirmed, setConsentConfirmed] = useState<Record<string, boolean>>({});
  const [consentMethod, setConsentMethod] = useState<Record<string, string>>({});
  const [schoolCoordinates, setSchoolCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const loadSchoolAdminData = useCallback(async (schoolId: string) => {
    const [invitesResult, codesResult, requestsResult] = await Promise.all([
      supabase.from("staff_invitations").select("id,email,role,status,expires_at,created_at").eq("school_id", schoolId).order("created_at", { ascending: false }),
      supabase.from("class_join_codes").select("id,label,code_hint,expires_at,max_uses,use_count,active,created_at").eq("school_id", schoolId).order("created_at", { ascending: false }),
      supabase.from("student_join_requests").select("id,student_display_name,guardian_name,guardian_email,consent_status,created_at").eq("school_id", schoolId).order("created_at", { ascending: false }),
    ]);

    if (!invitesResult.error) setStaffInvites((invitesResult.data ?? []) as StaffInvite[]);
    if (!codesResult.error) setClassCodes((codesResult.data ?? []) as ClassJoinCode[]);
    if (!requestsResult.error) setStudentRequests((requestsResult.data ?? []) as StudentJoinRequest[]);
  }, []);

  const loadDashboard = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_school_operations_dashboard");
    if (error || !data) {
      setLoadError(error?.message || "The school dashboard returned no data.");
      return;
    }

    const nextDashboard = data as Dashboard;
    setDashboard(nextDashboard);
    const { data: schoolLocation } = await supabase.from("schools").select("location").eq("id", nextDashboard.school.id).maybeSingle();
    setSchoolCoordinates(decodeGeometry(schoolLocation?.location));
    await loadSchoolAdminData(nextDashboard.school.id);
  }, [loadSchoolAdminData]);

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) await loadDashboard();
      setAuthReady(true);
    });
  }, [loadDashboard]);

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dashboard) return;

    const token = randomCode(28);
    const validUntil = new Date(Date.now() + codeExpiryDays * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.rpc("create_staff_invitation", {
      target_school: dashboard.school.id,
      invite_email: inviteEmail.trim(),
      invite_role: inviteRole,
      plain_token: token,
      valid_until: validUntil,
    });

    if (error) {
      setInviteMessage(error.message || "The staff invitation could not be created.");
      setGeneratedInviteToken(null);
      return;
    }

    // Send invitation email
    const emailResponse = await fetch("/api/notifications/staff-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitedEmail: inviteEmail.trim(),
        invitedRole: inviteRole,
        token: token,
      }),
    });

    if (emailResponse.ok) {
      setInviteMessage(`✅ Invitation sent to ${inviteEmail.trim()}. They will receive an email with the acceptance code.`);
    } else {
      const errorData = await emailResponse.json().catch(() => ({ error: "Unknown error" }));
      console.error("Email API error:", errorData);
      setInviteMessage(`⚠️ Invitation created but email could not be sent. Error: ${errorData.error || "Email service unavailable"}. Share this code manually with the teacher:`);
    }
    setGeneratedInviteToken(token);
    setInviteEmail("");
    setInviteRole("TEACHER");
    await loadSchoolAdminData(dashboard.school.id);
  }

  async function handleClassCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dashboard) return;

    const generated = randomCode(10);
    const validUntil = new Date(Date.now() + codeExpiryDays * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.rpc("create_class_join_code", {
      target_school: dashboard.school.id,
      plain_code: generated,
      code_label: codeLabel.trim() || "Class code",
      valid_until: validUntil,
      allowed_uses: codeUses,
    });

    if (error) {
      setCodeMessage(error.message || "The class code could not be created.");
      setGeneratedClassCode(null);
      return;
    }

    setGeneratedClassCode(generated);
    setCodeMessage("A new class join code was created. Share the code below with your students.");
    setCodeLabel("Class code");
    setCodeUses(40);
    setCodeExpiryDays(30);
    await loadSchoolAdminData(dashboard.school.id);
  }

  async function reviewStudent(requestId: string, decision: "VERIFIED" | "REJECTED" | "NEEDS_CHANGES") {
    if (decision === "VERIFIED" && !consentConfirmed[requestId]) {
      setStudentMessage("Please confirm that you have verified guardian or school consent before approving this student.");
      return;
    }

    setBusyStudentId(requestId);
    setStudentMessage(null);
    const { error } = await supabase.rpc("review_student_join_request", {
      request_id: requestId,
      review_decision: decision,
      consent_confirmed: Boolean(consentConfirmed[requestId]),
      consent_method: consentMethod[requestId] || "DIGITAL",
      notes: null,
    });

    if (error) {
      setStudentMessage("The student request could not be reviewed. Confirm your school role and database setup.");
    } else {
      setStudentMessage(`Student request marked ${decision.toLowerCase().replace("_", " ")}.`);
      if (dashboard) await loadSchoolAdminData(dashboard.school.id);
      setConsentConfirmed({});
      setConsentMethod({});
    }

    setBusyStudentId(null);
  }

  function captureSchoolLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available on this device.");
      return;
    }
    setLocationMessage("Finding the school location...");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (!dashboard) return;
      const location = `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`;
      const { error } = await supabase.from("schools").update({ location }).eq("id", dashboard.school.id);
      if (error) {
        setLocationMessage("The school location could not be saved. Check your school admin permissions.");
        return;
      }
      setSchoolCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
      setLocationMessage("School location saved.");
    }, () => setLocationMessage("We could not read your location. Allow location access and try again."), { enableHighAccuracy: true, timeout: 15000 });
  }

  if (authReady && !user) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">School staff sign-in required</h1><p className="mt-3 text-sm text-slate-600">This workspace is restricted to verified teachers and school administrators.</p><Link href="/auth" className="mt-5 inline-block text-sm font-bold text-emerald-800">Sign in securely</Link></section></main>;
  if (!authReady || !dashboard) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">School data unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-600">{loadError || "Loading your live school dashboard..."}</p><Link href="/portal" className="mt-5 inline-block text-sm font-bold text-emerald-800">Return to portal</Link></section></main>;

  const metrics = [
    ["Verified students", dashboard.metrics.verified_students, Users, "bg-violet-100 text-violet-700"],
    ["Pending consent", dashboard.metrics.pending_students, UserCheck, "bg-amber-100 text-amber-800"],
    ["Teacher review", dashboard.metrics.teacher_review, ClipboardCheck, "bg-lime-100 text-lime-800"],
    ["Verified records", dashboard.metrics.verified_observations, CheckCircle2, "bg-emerald-100 text-emerald-800"],
  ] as const;

  const mapObservations = dashboard.recent_observations.filter((item) => item.latitude !== null && item.longitude !== null);
  const mapMinLat = Math.min(...mapObservations.map((item) => item.latitude ?? 0), 0);
  const mapMaxLat = Math.max(...mapObservations.map((item) => item.latitude ?? 0), 0);
  const mapMinLng = Math.min(...mapObservations.map((item) => item.longitude ?? 0), 0);
  const mapMaxLng = Math.max(...mapObservations.map((item) => item.longitude ?? 0), 0);
  const mapPoints = schoolCoordinates ? [...mapObservations, { latitude: schoolCoordinates.latitude, longitude: schoolCoordinates.longitude }] : mapObservations;
  const mapUrl = mapPoints.length ? `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(...mapPoints.map((item) => item.longitude ?? 0)) - 0.01}%2C${Math.min(...mapPoints.map((item) => item.latitude ?? 0)) - 0.01}%2C${Math.max(...mapPoints.map((item) => item.longitude ?? 0)) + 0.01}%2C${Math.max(...mapPoints.map((item) => item.latitude ?? 0)) + 0.01}&layer=mapnik` : null;

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-7"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Logo /><div className="flex items-center gap-3"><span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-800 sm:block">{dashboard.role.replaceAll("_", " ")}</span><AccountMenu /></div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black tracking-[.18em] text-emerald-700">SCHOOL OPERATIONS</p><h1 className="mt-2 font-serif text-4xl text-emerald-950">{dashboard.school.name}</h1><p className="mt-2 text-sm text-slate-500">Student access, evidence review and biodiversity progress in one protected workspace.</p></div><Link href="/teacher" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0b4436] px-5 text-xs font-bold text-white">Open teacher queue <ArrowRight className="size-4" /></Link></section>
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label,value,Icon,tone]) => <article key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"><span className={`grid size-12 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><small className="text-[9px] font-black tracking-[.12em] text-slate-400">{label.toUpperCase()}</small><strong className="mt-1 block font-serif text-3xl text-emerald-950">{value}</strong></div></article>)}</section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[9px] font-black tracking-[.15em] text-emerald-700">SCHOOL ACTIVITY MAP</p>
          <h2 className="mt-2 font-serif text-2xl text-emerald-950">Live field captures</h2>
          <div className="relative mt-4 h-64 overflow-hidden rounded-xl border border-slate-200 bg-[#e7efe1]">
            {mapUrl && <iframe title="Live school activity map" src={mapUrl} className="absolute inset-0 size-full border-0 opacity-80" loading="lazy" />}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.6),transparent_35%),linear-gradient(150deg,rgba(255,255,255,0.5)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,0.5)_87.5%)] bg-[length:54px_94px]" />
            <div className="absolute left-[18%] top-[24%] h-[44%] w-[42%] rotate-[-8deg] rounded-[44%_35%_40%_30%] border-2 border-emerald-700/45 bg-lime-300/30" />
            <div className="absolute bottom-[10%] right-[10%] h-[20%] w-[22%] rounded-lg border border-slate-400 bg-slate-300/45" />
            {mapObservations.map((item) => {
              const lat = item.latitude ?? 0;
              const lng = item.longitude ?? 0;
              const rangeLat = Math.max(mapMaxLat - mapMinLat, 1e-6);
              const rangeLng = Math.max(mapMaxLng - mapMinLng, 1e-6);
              const x = 10 + ((lng - mapMinLng) / rangeLng) * 78;
              const y = 82 - ((lat - mapMinLat) / rangeLat) * 66;
              return <span key={item.id} className="absolute grid size-5 place-items-center rounded-full border-4 border-white bg-emerald-700 text-[8px] font-black text-white shadow" style={{ left: `${x}%`, top: `${y}%` }}>•</span>;
            })}
          </div>
          <p className="mt-3 text-[10px] leading-5 text-slate-500">School staff can see captured record locations, pending review items and verified observation coverage in one map view.</p>
          <button type="button" onClick={captureSchoolLocation} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-950 px-4 text-xs font-bold text-white"><MapPin className="size-4" />{schoolCoordinates ? "Update school location" : "Add school location"}</button>
          {schoolCoordinates && <p className="mt-2 text-[10px] text-emerald-700">{schoolCoordinates.latitude.toFixed(5)}, {schoolCoordinates.longitude.toFixed(5)}</p>}
          {locationMessage && <p className="mt-2 text-[10px] text-slate-500">{locationMessage}</p>}
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[9px] font-black tracking-[.15em] text-emerald-700">INVITE SCHOOL STAFF</p>
          <h2 className="mt-2 font-serif text-2xl text-emerald-950">Invite a teacher or school admin</h2>
          <form onSubmit={handleInviteSubmit} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-xs font-bold text-slate-700">
              <span>Invited email</span>
              <input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} type="email" required className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" placeholder="teacher@school.org" />
            </label>
            <label className="grid gap-2 text-xs font-bold text-slate-700">
              <span>Role</span>
              <select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as "SCHOOL_ADMIN" | "TEACHER")} className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal">
                <option value="TEACHER">Teacher</option>
                <option value="SCHOOL_ADMIN">School admin</option>
              </select>
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b4436] px-5 text-xs font-bold text-white">Create invitation</button>
          </form>
          {inviteMessage && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{inviteMessage}</p>}
          {generatedInviteToken && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-[9px] font-black tracking-[.14em] text-emerald-700">ONE-TIME INVITATION CODE</p><div className="mt-3 rounded-lg bg-white px-4 py-3 font-mono text-sm font-black tracking-[.16em] text-emerald-950">{generatedInviteToken}</div></div>}
          <div className="mt-5 space-y-3">
            <p className="text-[9px] font-black tracking-[.12em] text-slate-400">RECENT INVITES</p>
            {staffInvites.length === 0 ? <p className="text-xs text-slate-500">No invitations yet.</p> : staffInvites.map((invite) => <div key={invite.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"><div><strong className="block text-emerald-900">{invite.email}</strong><span className="text-slate-500">{invite.role} · {invite.status}</span></div><span className="text-slate-400">{new Date(invite.expires_at).toLocaleDateString()}</span></div>)}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[9px] font-black tracking-[.15em] text-emerald-700">STUDENT JOIN CODES</p>
          <h2 className="mt-2 font-serif text-2xl text-emerald-950">Create a class join code</h2>
          <form onSubmit={handleClassCodeSubmit} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-xs font-bold text-slate-700">
              <span>Code label</span>
              <input value={codeLabel} onChange={(event) => setCodeLabel(event.target.value)} className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" placeholder="Grade 7 Science" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-bold text-slate-700">
                <span>Valid for days</span>
                <input type="number" min={1} max={180} value={codeExpiryDays} onChange={(event) => setCodeExpiryDays(Number(event.target.value) || 30)} className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" />
              </label>
              <label className="grid gap-2 text-xs font-bold text-slate-700">
                <span>Allowed uses</span>
                <input type="number" min={1} max={500} value={codeUses} onChange={(event) => setCodeUses(Number(event.target.value) || 40)} className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" />
              </label>
            </div>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b4436] px-5 text-xs font-bold text-white">Generate class code</button>
          </form>
          {codeMessage && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">{codeMessage}</p>}
          {generatedClassCode && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-[9px] font-black tracking-[.14em] text-emerald-700">CLASS JOIN CODE</p><div className="mt-3 rounded-lg bg-white px-4 py-3 font-mono text-lg font-black tracking-[.16em] text-emerald-950">{generatedClassCode}</div></div>}
          <div className="mt-5 space-y-3">
            <p className="text-[9px] font-black tracking-[.12em] text-slate-400">ACTIVE CODES</p>
            {classCodes.length === 0 ? <p className="text-xs text-slate-500">No class codes yet.</p> : classCodes.map((code) => <div key={code.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"><div><strong className="block text-emerald-900">{code.label}</strong><span className="text-slate-500">{code.code_hint} · {code.use_count}/{code.max_uses} used</span></div><span className="text-slate-400">{new Date(code.expires_at).toLocaleDateString()}</span></div>)}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.7fr)]">
        {studentRequests.some((r) => r.consent_status === "PENDING") && (
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-black tracking-[.15em] text-emerald-700">STUDENT ONBOARDING</p>
            <h2 className="mt-2 font-serif text-2xl text-emerald-950">Approve pending students</h2>
            {studentMessage && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">{studentMessage}</p>}
            <div className="mt-5 space-y-4">
              {studentRequests.length === 0 ? (
                <p className="text-xs text-slate-500">No student requests.</p>
              ) : (
                studentRequests
                  .filter((r) => r.consent_status === "PENDING")
                  .map((student) => (
                    <article key={student.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="grid gap-4">
                        <div>
                          <h3 className="font-bold text-emerald-950">{student.student_display_name}</h3>
                          <p className="mt-1 text-xs text-slate-500">Guardian: {student.guardian_name}</p>
                          <p className="text-xs text-slate-500">{student.guardian_email}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                          <label className="flex items-center gap-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              checked={Boolean(consentConfirmed[student.id])}
                              onChange={(event) =>
                                setConsentConfirmed((current) => ({
                                  ...current,
                                  [student.id]: event.target.checked,
                                }))
                              }
                              className="size-4 accent-emerald-700"
                            />
                            <span>I verified valid consent from guardian or school</span>
                          </label>
                          <select
                            value={consentMethod[student.id] || "DIGITAL"}
                            onChange={(event) =>
                              setConsentMethod((current) => ({
                                ...current,
                                [student.id]: event.target.value,
                              }))
                            }
                            className="min-h-10 rounded-lg border border-slate-300 px-3 text-xs font-normal"
                          >
                            <option value="DIGITAL">Digital consent</option>
                            <option value="PAPER">Paper consent</option>
                            <option value="SCHOOL_AUTHORITY">School authority</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => void reviewStudent(student.id, "VERIFIED")}
                            disabled={busyStudentId === student.id}
                            className="inline-flex min-h-10 items-center rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                          >
                            Approve student
                          </button>
                          <button
                            onClick={() => void reviewStudent(student.id, "NEEDS_CHANGES")}
                            disabled={busyStudentId === student.id}
                            className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Request changes
                          </button>
                          <button
                            onClick={() => void reviewStudent(student.id, "REJECTED")}
                            disabled={busyStudentId === student.id}
                            className="inline-flex min-h-10 items-center rounded-lg px-4 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
              )}
            </div>
          </article>
        )}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><p className="text-[9px] font-black tracking-[.15em] text-slate-400">SCHOOL EVIDENCE</p><h2 className="mt-1 font-serif text-2xl text-emerald-950">Recent observations</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800">{dashboard.metrics.expert_review} with experts</span></div><div className="divide-y divide-slate-100">{dashboard.recent_observations.map((observation) => <div key={observation.id} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 p-4 sm:px-5"><span className="grid size-10 place-items-center rounded-xl bg-lime-100 text-emerald-800"><Leaf className="size-4" /></span><span className="min-w-0"><strong className="block truncate text-xs text-emerald-950">{observation.scientific_name || observation.common_name || observation.observation_type}</strong><small className="mt-1 block text-[10px] text-slate-400">{observation.observation_type} · {new Date(observation.observed_at).toLocaleDateString()}</small></span><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${observation.verification_status === "VERIFIED" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{stageLabel[observation.review_stage] || observation.verification_status}</span></div>)}</div></article>

        <aside className="grid gap-5">
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="relative h-52 bg-[linear-gradient(135deg,#e8eddc,#c6d7bd)]"><span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[9px] font-bold text-emerald-900">Sensitive records hidden</span></div>
            <div className="p-5"><p className="text-[9px] font-black tracking-[.15em] text-slate-400">PRIVACY-SAFE MAP</p><h2 className="mt-1 font-serif text-xl">School biodiversity map</h2><p className="mt-2 text-xs leading-5 text-slate-500">Only approximate coordinates are returned here. Critical species locations are withheld.</p></div>
          </article>
          <article className="rounded-2xl bg-[#0b4436] p-5 text-white">
            <p className="text-[9px] font-black tracking-[.15em] text-emerald-100/70">STUDENT STATUS</p>
            <div className="mt-4 space-y-3">
              <div>
                <strong className="block text-xs text-white">Verified students</strong>
                <span className="mt-1 block font-mono text-lg font-bold text-lime-300">{dashboard.metrics.verified_students}</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <strong className="block text-xs text-white">Pending approval</strong>
                <span className="mt-1 block font-mono text-lg font-bold text-amber-300">{studentRequests.filter((r) => r.consent_status === "PENDING").length}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-emerald-100/65"><FolderKanban className="size-4" />{dashboard.metrics.active_projects} active school projects</div>
          </article>
        </aside>
      </section>
    </div>
  </main>;
}

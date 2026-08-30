"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Logo } from "../../../components/app/logo";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../lib/supabase/client";

type ApplicantType = "SCHOOL" | "MENTOR" | "PARTNER";

export function RegistrationApplication() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [type, setType] = useState<ApplicantType>("SCHOOL");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      const proposed = data.user?.user_metadata?.applicant_type;
      if (proposed === "SCHOOL" || proposed === "MENTOR" || proposed === "PARTNER") setType(proposed);
      setChecking(false);
    });
  }, []);

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setMessage(null);
    const values = new FormData(event.currentTarget);
    const { error } = await supabase.from("registration_applications").insert({
      applicant_user_id: user.id,
      application_type: type,
      organization_name: String(values.get("organizationName") || "").trim() || null,
      country_code: String(values.get("countryCode") || "NG").toUpperCase(),
      state_region: String(values.get("stateRegion") || "").trim(),
      city: String(values.get("city") || "").trim(),
      phone: String(values.get("phone") || "").trim() || null,
      website: String(values.get("website") || "").trim() || null,
      credentials_summary: String(values.get("credentials") || "").trim() || null,
      motivation: String(values.get("motivation") || "").trim(),
    });
    if (error) setMessage(error.code === "23505" ? "You already have a pending application of this type." : "The application database is not active yet. Your verified account is ready; an administrator must apply the onboarding migration before submission.");
    else setSubmitted(true);
    setBusy(false);
  }

  if (checking) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm text-emerald-950">Checking your verified account…</main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-8 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">Verify your email first</h1><p className="mt-3 text-sm text-slate-600">Open the secure link sent to your email, then return here.</p><Link href="/register" className="mt-5 inline-block text-sm font-bold text-emerald-800">Return to registration</Link></section></main>;
  if (submitted) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto size-11 text-emerald-700" /><p className="mt-5 text-[10px] font-bold tracking-[.18em] text-emerald-700">APPLICATION RECEIVED</p><h1 className="mt-3 font-serif text-4xl text-emerald-950">Thank you for applying.</h1><p className="mt-4 text-sm leading-6 text-slate-600">Your account remains restricted while GeoMentor Africa reviews your organization or credentials. We will contact you through your verified email.</p><Link href="/" className="mt-6 inline-block text-sm font-bold text-emerald-800">Return to pilot overview</Link></section></main>;

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-[#15342d]"><div className="mx-auto max-w-3xl"><Logo /><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><p className="text-[10px] font-bold tracking-[.18em] text-emerald-700">STEP 2 OF 2 · VERIFIED EMAIL</p><h1 className="mt-3 font-serif text-4xl text-emerald-950">Complete your application</h1><p className="mt-3 text-sm text-slate-600">Signed in as {user.email}. Trusted access is granted only after review.</p>
      <form className="mt-7 grid gap-5" onSubmit={submitApplication}>
        <label className="grid gap-2 text-xs font-bold text-slate-700"><span>Application type</span><select className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" value={type} onChange={(event) => setType(event.target.value as ApplicantType)}><option value="SCHOOL">School</option><option value="MENTOR">Geo-Mentor</option><option value="PARTNER">Geo-Partner</option></select></label>
        {(type === "SCHOOL" || type === "PARTNER") && <label className="grid gap-2 text-xs font-bold text-slate-700"><span>{type === "SCHOOL" ? "School or institution name" : "Partner organization name"}</span><input name="organizationName" className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" required minLength={2} maxLength={180} /></label>}
        <div className="grid gap-4 sm:grid-cols-3"><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Country code</span><input name="countryCode" className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal uppercase" defaultValue="NG" required minLength={2} maxLength={2} /></label><label className="grid gap-2 text-xs font-bold text-slate-700"><span>State or region</span><input name="stateRegion" className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" required maxLength={120} /></label><label className="grid gap-2 text-xs font-bold text-slate-700"><span>City</span><input name="city" className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" required maxLength={120} /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Phone <em className="font-normal text-slate-400">Optional</em></span><input name="phone" type="tel" className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" maxLength={30} /></label><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Website or professional profile <em className="font-normal text-slate-400">Optional</em></span><input name="website" type="url" className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" maxLength={300} /></label></div>
        {type !== "SCHOOL" && <label className="grid gap-2 text-xs font-bold text-slate-700"><span>{type === "MENTOR" ? "Qualifications and relevant experience" : "Partnership capacity and proposed support"}</span><textarea name="credentials" className="min-h-28 rounded-lg border border-slate-300 p-3 text-sm font-normal" required minLength={30} maxLength={2000} placeholder={type === "MENTOR" ? "Qualification level, discipline, research, industry, conservation, GIS or education experience…" : "Funding, materials, software, excursions, scholarships, equipment or technical collaboration…"} /></label>}
        <label className="grid gap-2 text-xs font-bold text-slate-700"><span>Why do you want to join GeoMentor Africa?</span><textarea name="motivation" className="min-h-28 rounded-lg border border-slate-300 p-3 text-sm font-normal" required minLength={30} maxLength={1500} /></label>
        <label className="flex gap-3 rounded-xl bg-emerald-50 p-4 text-xs leading-5 text-slate-600"><input type="checkbox" required className="mt-1 size-4 accent-emerald-700" /><span>I confirm that the information is accurate and understand that submitting this application does not grant access to student information.</span></label>
        {message && <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900" role="alert">{message}</div>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? "Submitting application…" : "Submit for review"}</Button>
      </form></section></div></main>
  );
}

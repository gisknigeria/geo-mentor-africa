"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Building2, GraduationCap, Handshake, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase/client";

type ApplicantType = "SCHOOL" | "MENTOR" | "PARTNER";

const applicantTypes = [
  { value: "SCHOOL" as const, label: "School", description: "Register a school or learning institution", icon: Building2 },
  { value: "MENTOR" as const, label: "Geo-Mentor", description: "Adopt schools, guide learning and review records", icon: GraduationCap },
  { value: "PARTNER" as const, label: "Geo-Partner", description: "Fund and support visible school outcomes", icon: Handshake },
];

export function RegisterForm() {
  const [type, setType] = useState<ApplicantType>("SCHOOL");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function startRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const next = encodeURIComponent("/auth/set-password?next=/register/complete");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        data: { display_name: displayName.trim(), applicant_type: type },
      },
    });
    setMessage(error ? "Registration could not start. Check your details and try again." : "Check your email and open the verification link to complete your application.");
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-[#15342d]">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between"><Logo /><Link href="/auth" className="text-xs font-bold text-emerald-800 hover:underline">Already registered? Sign in</Link></header>
        <section className="mt-10 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_80px_rgba(17,59,47,.1)] lg:grid-cols-[.9fr_1.1fr]">
          <div className="bg-[radial-gradient(circle_at_85%_5%,rgba(198,225,93,.24),transparent_34%),linear-gradient(145deg,#174f3e,#0b392e)] p-7 text-white sm:p-10">
            <p className="text-[10px] font-bold tracking-[.18em] text-lime-200">JOIN THE PILOT</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Grow environmental learning with us.</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-emerald-50/75">Choose one of the platform’s three roles. Teachers and students are onboarded by their registered school; students join through a supervised class code.</p>
            <div className="mt-8 grid gap-4 text-xs text-emerald-50/85"><span className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-lime-300" />Verified email before application</span><span className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-lime-300" />Schools, mentor credentials and partners reviewed</span><span className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-lime-300" />No automatic access to student records</span></div>
            <Link href="/join" className="mt-10 inline-flex rounded-lg border border-white/25 px-4 py-3 text-xs font-bold text-white hover:bg-white/10">Student? Join with a class code →</Link>
          </div>
          <form className="p-7 sm:p-10" onSubmit={startRegistration}>
            <p className="text-[10px] font-bold tracking-[.18em] text-emerald-700">STEP 1 OF 2</p>
            <h2 className="mt-3 font-serif text-3xl text-emerald-950">Choose how you want to join</h2>
            <fieldset className="mt-6 grid gap-3 sm:grid-cols-3"><legend className="sr-only">Applicant type</legend>{applicantTypes.map(({ value, label, description, icon: Icon }) => <label key={value} className={cn("cursor-pointer rounded-xl border p-4 transition focus-within:ring-4 focus-within:ring-emerald-100", type === value ? "border-emerald-700 bg-emerald-50" : "border-slate-200 hover:border-emerald-300")}><input className="sr-only" type="radio" name="applicantType" value={value} checked={type === value} onChange={() => setType(value)} /><Icon className="size-5 text-emerald-700" /><strong className="mt-3 block text-sm">{label}</strong><small className="mt-1 block text-[10px] leading-4 text-slate-500">{description}</small></label>)}</fieldset>
            <div className="mt-7 grid gap-4">
              <label className="grid gap-2 text-xs font-bold text-slate-700"><span>Your full name</span><input className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" required minLength={2} maxLength={80} autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="e.g. Kemi Adeyemi" /></label>
              <label className="grid gap-2 text-xs font-bold text-slate-700"><span>Work or school email</span><span className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><Mail className="size-4 text-slate-400" /><input className="min-w-0 flex-1 bg-transparent text-sm font-normal outline-none" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@organization.org" /></span></label>
              <Button type="submit" size="lg" disabled={busy}>{busy ? "Sending verification…" : "Verify email and continue"}</Button>
            </div>
            {message && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900" role="status">{message}</div>}
            <p className="mt-5 text-[10px] leading-5 text-slate-400">Submitting does not grant platform access. GeoMentor Africa reviews every school, mentor and expert application.</p>
          </form>
        </section>
      </div>
    </main>
  );
}

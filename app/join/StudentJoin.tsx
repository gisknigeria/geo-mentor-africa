"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { KeyRound, Mail, School, ShieldCheck } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase/client";

export function StudentJoin() {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  async function verifyStudentEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const values = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithOtp({
      email: String(values.get("email") || "").trim(),
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/set-password?next=/join")}`, data: { display_name: String(values.get("displayName") || "").trim(), applicant_type: "STUDENT" } },
    });
    setMessage(error ? "We could not send the verification link. Check the email and try again." : "Open the verification link sent to the student or school-managed email, then enter the class code.");
    setBusy(false);
  }

  async function joinSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const values = new FormData(event.currentTarget);
    const { error } = await supabase.rpc("join_school_with_code", {
      join_code: String(values.get("classCode") || "").trim(),
      student_name: String(values.get("studentName") || "").trim(),
      guardian_name: String(values.get("guardianName") || "").trim(),
      guardian_email: String(values.get("guardianEmail") || "").trim(),
    });
    if (error) setMessage(error.message.includes("Invalid or expired") ? "That class code is invalid, expired or has reached its limit. Ask your teacher for a new code." : "The student-joining database is not active yet. Ask the school administrator to finish platform setup.");
    else setSuccess(true);
    setBusy(false);
  }

  if (success) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm"><School className="mx-auto size-10 text-emerald-700" /><h1 className="mt-5 font-serif text-4xl text-emerald-950">Request sent to your school.</h1><p className="mt-4 text-sm leading-6 text-slate-600">A teacher must confirm the student and record the required guardian or school consent before access becomes active.</p><Link href="/" className="mt-6 inline-block text-sm font-bold text-emerald-800">Return to overview</Link></section></main>;

  return <main className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-[#15342d]"><div className="mx-auto max-w-3xl"><header className="flex items-center justify-between"><Logo /><Link href="/register" className="text-xs font-bold text-emerald-800">School, mentor or expert?</Link></header><section className="mt-9 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[.75fr_1.25fr]"><aside className="bg-emerald-950 p-7 text-white"><KeyRound className="size-7 text-lime-300" /><p className="mt-8 text-[10px] font-bold tracking-[.18em] text-lime-200">SUPERVISED STUDENT ACCESS</p><h1 className="mt-3 font-serif text-4xl">Join your school project.</h1><p className="mt-4 text-xs leading-6 text-emerald-50/75">Use only a code given by your teacher. Joining creates a pending request; it does not immediately reveal school or student information.</p><div className="mt-7 flex gap-3 rounded-xl bg-white/10 p-4 text-xs leading-5 text-emerald-50/80"><ShieldCheck className="size-5 shrink-0 text-lime-300" />A teacher must verify membership and required consent.</div></aside><div className="p-7 sm:p-9">{!user ? <form className="grid gap-5" onSubmit={verifyStudentEmail}><div><p className="text-[10px] font-bold tracking-[.18em] text-emerald-700">FIRST, VERIFY THE STUDENT</p><h2 className="mt-2 font-serif text-3xl text-emerald-950">School-managed email</h2><p className="mt-2 text-xs leading-5 text-slate-500">A teacher may supervise this step. Personal email is not required when the school supplies an account.</p></div><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Student display name</span><input name="displayName" required minLength={2} maxLength={80} className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Student or school-managed email</span><span className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3"><Mail className="size-4 text-slate-400" /><input name="email" type="email" required className="min-w-0 flex-1 text-sm font-normal outline-none" /></span></label><Button type="submit" size="lg" disabled={busy}>{busy ? "Sending verification…" : "Verify email"}</Button>{message && <div className="rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900" role="status">{message}</div>}</form> : <form className="grid gap-5" onSubmit={joinSchool}><div><p className="text-[10px] font-bold tracking-[.18em] text-emerald-700">VERIFIED · {user.email}</p><h2 className="mt-2 font-serif text-3xl text-emerald-950">Enter your class code</h2></div><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Class code</span><input name="classCode" required minLength={6} maxLength={32} autoCapitalize="characters" className="min-h-14 rounded-lg border border-slate-300 px-4 text-center font-mono text-xl font-black uppercase tracking-[.22em]" placeholder="GREEN-24" /></label><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Student display name</span><input name="studentName" required minLength={2} maxLength={80} defaultValue={String(user.user_metadata?.display_name || "")} className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Guardian name</span><input name="guardianName" required minLength={2} maxLength={120} className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Guardian email</span><input name="guardianEmail" type="email" required className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" /></label></div><label className="flex gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900"><input type="checkbox" required className="mt-1 size-4 accent-emerald-700" /><span>I understand that a teacher must verify this request and record the required consent before the account becomes active.</span></label><Button type="submit" size="lg" disabled={busy}>{busy ? "Sending request…" : "Request to join school"}</Button>{message && <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900" role="alert">{message}</div>}</form>}</div></section></div></main>;
}

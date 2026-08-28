"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase/client";

export function StaffInvitation() {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const values = new FormData(event.currentTarget);
    const { error } = await supabase.auth.signInWithOtp({ email: String(values.get("email") || "").trim(), options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/set-password?next=/invite")}`, data: { display_name: String(values.get("displayName") || "").trim(), applicant_type: "STAFF_INVITEE" } } });
    setMessage(error ? "The verification email could not be sent." : "Open the secure email link, then return to enter the one-time invitation code.");
    setBusy(false);
  }

  async function acceptInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const values = new FormData(event.currentTarget);
    const { error } = await supabase.rpc("accept_staff_invitation", { invite_token: String(values.get("inviteToken") || "").trim() });
    if (error) setMessage(error.message.includes("different verified email") ? "This invitation belongs to another verified email address." : "That invitation is invalid, expired, already used or the database is not active.");
    else setAccepted(true);
    setBusy(false);
  }

  if (accepted) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto size-11 text-emerald-700" /><h1 className="mt-5 font-serif text-4xl text-emerald-950">Staff access activated.</h1><p className="mt-4 text-sm leading-6 text-slate-600">Your verified role is now attached to the inviting school.</p><Link href="/" className="mt-6 inline-block text-sm font-bold text-emerald-800">Continue to GeoMentor Africa</Link></section></main>;

  return <main className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-[#15342d]"><div className="mx-auto max-w-2xl"><Logo /><section className="mt-9 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><div className="flex gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-lime-100 text-emerald-800"><KeyRound className="size-6" /></span><div><p className="text-[10px] font-bold tracking-[.18em] text-emerald-700">SCHOOL STAFF INVITATION</p><h1 className="mt-2 font-serif text-4xl text-emerald-950">Accept your trusted role</h1><p className="mt-3 text-sm leading-6 text-slate-600">The invitation works only for the email selected by your school administrator.</p></div></div>
    {!user ? <form onSubmit={verifyEmail} className="mt-7 grid gap-4"><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Full name</span><input name="displayName" required minLength={2} maxLength={80} className="min-h-12 rounded-lg border border-slate-300 px-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Invited email</span><span className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3"><Mail className="size-4 text-slate-400" /><input name="email" type="email" required className="min-w-0 flex-1 text-sm font-normal outline-none" /></span></label><Button type="submit" size="lg" disabled={busy}>{busy ? "Sending verification…" : "Verify invited email"}</Button></form> : <form onSubmit={acceptInvitation} className="mt-7 grid gap-4"><div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">Verified as <strong>{user.email}</strong></div><label className="grid gap-2 text-xs font-bold text-slate-700"><span>One-time invitation code</span><input name="inviteToken" required minLength={24} maxLength={80} autoCapitalize="characters" className="min-h-14 rounded-lg border border-slate-300 px-4 text-center font-mono text-lg font-black uppercase tracking-[.16em]" /></label><div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900"><ShieldCheck className="size-5 shrink-0" />Accepting gives access only to the inviting school and assigned staff role.</div><Button type="submit" size="lg" disabled={busy}>{busy ? "Activating role…" : "Accept invitation"}</Button></form>}
    {message && <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900" role="status">{message}</div>}<Link href="/" className="mt-6 inline-block text-xs font-bold text-emerald-800">← Return to overview</Link></section></div></main>;
}

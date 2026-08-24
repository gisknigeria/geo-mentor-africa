"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase/client";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setMessage(error ? "We could not send a sign-in link. Confirm that your school administrator has invited this email address." : "Check your email for a secure sign-in link. You can close this page after opening it.");
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-[#15342d] sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(17,59,47,.1)] sm:p-8">
        <Logo />
        <p className="mt-10 text-[10px] font-bold tracking-[.18em] text-emerald-700">INVITE-ONLY PILOT</p>
        <h1 className="mt-3 font-serif text-4xl text-emerald-950">Sign in securely</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Use the email invited by your school. We will send a one-time link—no password to remember.</p>
        <form className="mt-7 grid gap-4" onSubmit={requestSignIn}>
          <label className="grid gap-2 text-xs font-bold text-slate-700"><span>Email address</span><span className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><Mail className="size-4 text-slate-400" /><input className="min-w-0 flex-1 bg-transparent text-sm font-normal outline-none" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.org" /></span></label>
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Sending secure link…" : "Email me a sign-in link"}</Button>
        </form>
        {message && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900" role="status">{message}</div>}
        <div className="mt-6 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" /><p className="text-xs leading-5 text-slate-600"><strong className="block text-emerald-950">Protected school access</strong>Your role and school membership are checked by the database for every record.</p></div>
        <div className="mt-6 flex items-center justify-between gap-3"><Link href="/" className="text-xs font-bold text-emerald-800 hover:underline">← Return to pilot preview</Link><Link href="/register" className="text-xs font-bold text-emerald-800 hover:underline">Apply to join →</Link></div>
      </section>
    </main>
  );
}

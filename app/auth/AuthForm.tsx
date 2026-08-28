"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signInWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setMessage("Sign-in failed. Check your email and password, and confirm that this user exists in Supabase Authentication.");
      setBusy(false);
      return;
    }
    router.replace("/portal");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-[#15342d] sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(17,59,47,.1)] sm:p-8">
        <Logo />
        <p className="mt-10 text-[10px] font-bold tracking-[.18em] text-emerald-700">INVITE-ONLY PILOT</p>
        <h1 className="mt-3 font-serif text-4xl text-emerald-950">Sign in securely</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Sign in with the account created for you. GeoMentor will open only the workspace assigned to your verified role.</p>
        <form className="mt-7 grid gap-4" onSubmit={signInWithPassword}>
          <label className="grid gap-2 text-xs font-bold text-slate-700"><span>Email address</span><span className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><Mail className="size-4 text-slate-400" /><input className="min-w-0 flex-1 bg-transparent text-sm font-normal outline-none" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@school.org" /></span></label>
          <label className="grid gap-2 text-xs font-bold text-slate-700"><span>Password</span><span className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><KeyRound className="size-4 text-slate-400" /><input className="min-w-0 flex-1 bg-transparent text-sm font-normal outline-none" type={showPassword ? "text" : "password"} required minLength={6} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your account password" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="grid size-8 place-items-center text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Signing in…" : "Sign in to my portal"}</Button>
        </form>
        {message && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900" role="status">{message}</div>}
        <div className="mt-6 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" /><p className="text-xs leading-5 text-slate-600"><strong className="block text-emerald-950">Protected school access</strong>Your role and school membership are checked by the database for every record.</p></div>
        <div className="mt-6 flex items-center justify-between gap-3"><Link href="/" className="text-xs font-bold text-emerald-800 hover:underline">← Return to pilot preview</Link><Link href="/register" className="text-xs font-bold text-emerald-800 hover:underline">Apply to join →</Link></div>
      </section>
    </main>
  );
}

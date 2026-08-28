"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Logo } from "../../../components/app/logo";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../lib/supabase/client";

const allowedNext = ["/portal", "/register/complete", "/join", "/invite"];

export default function SetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function setAccountPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage("The passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    const next = requestedNext && allowedNext.includes(requestedNext) ? requestedNext : "/portal";
    router.replace(next);
    router.refresh();
  }

  if (!email) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4 text-sm text-emerald-950">Your verification session is missing or expired. <Link href="/auth" className="ml-1 font-bold text-emerald-800">Sign in again</Link></main>;

  return <main className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-[#15342d] sm:grid sm:place-items-center"><section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><Logo /><p className="mt-10 text-[10px] font-bold tracking-[.18em] text-emerald-700">EMAIL VERIFIED</p><h1 className="mt-3 font-serif text-4xl text-emerald-950">Set your password</h1><p className="mt-3 text-sm leading-6 text-slate-600">Create a password for <strong>{email}</strong>. You will use it for future sign-ins.</p><form className="mt-7 grid gap-4" onSubmit={setAccountPassword}><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Password</span><span className="flex min-h-12 items-center rounded-lg border border-slate-300 px-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><input type={showPassword ? "text" : "password"} required minLength={6} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-w-0 flex-1 text-sm font-normal outline-none" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="grid size-8 place-items-center text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label><label className="grid gap-2 text-xs font-bold text-slate-700"><span>Confirm password</span><span className="flex min-h-12 items-center rounded-lg border border-slate-300 px-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><input type={showConfirmation ? "text" : "password"} required minLength={6} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="min-w-0 flex-1 text-sm font-normal outline-none" /><button type="button" onClick={() => setShowConfirmation((current) => !current)} className="grid size-8 place-items-center text-slate-500" aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"}>{showConfirmation ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>{message && <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900" role="alert">{message}</div>}<Button type="submit" size="lg" disabled={busy}><KeyRound className="size-4" />{busy ? "Saving password…" : "Save password"}</Button></form><div className="mt-6 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" /><p className="text-xs leading-5 text-slate-600">Your role is still subject to GeoMentor approval. Setting a password alone does not grant access.</p></div></section></main>;
}

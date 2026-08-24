"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing your secure sign-in…");

  useEffect(() => {
    let active = true;
    const finish = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error || !data.session) {
        setMessage("This sign-in link is invalid or has expired. Return to sign in and request a new one.");
        return;
      }
      const requested = searchParams.get("next");
      const next = requested === "/register/complete" || requested === "/join" || requested === "/invite" ? requested : "/";
      router.replace(next);
      router.refresh();
    };
    void finish();
    return () => { active = false; };
  }, [router, searchParams]);

  return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-5"><div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-emerald-950 shadow-sm" role="status">{message}</div></main>;
}

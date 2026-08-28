"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { AccountMenu } from "../components/app/account-menu";
import { Logo } from "../components/app/logo";

export function LandingHeader() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b4436]/95 px-4 py-4 text-white backdrop-blur-xl sm:px-7"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Logo /><nav className="hidden items-center gap-6 text-xs font-bold text-emerald-100/75 md:flex" aria-label="Public navigation"><a href="#how">How it works</a><a href="#people">Who it serves</a><Link href="/pilot">Pilot guide</Link><a href="#safety">Safeguarding</a></nav><div className="flex items-center gap-2"><AccountMenu />{ready && !signedIn && <Link href="/register" className="hidden min-h-10 items-center rounded-lg bg-lime-300 px-4 text-xs font-black text-emerald-950 hover:bg-lime-200 sm:inline-flex">Join the pilot</Link>}</div></div></header>;
}

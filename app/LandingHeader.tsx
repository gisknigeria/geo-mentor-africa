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

  return <header className="sticky top-0 z-30 border-b border-white/10 bg-[#082f27]/95 px-4 py-3.5 text-white backdrop-blur-xl sm:px-7"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4"><Logo /><nav className="hidden items-center gap-6 text-[11px] font-bold text-emerald-100/75 lg:flex" aria-label="Public navigation"><a href="/#roles">Who it serves</a><a href="/#map">School map</a><Link href="/observations">Biodiversity</Link><Link href="/partner">Fund impact</Link><Link href="/pilot">Programme</Link></nav><div className="flex items-center gap-2"><AccountMenu />{ready && !signedIn && <Link href="/register" className="hidden min-h-10 items-center rounded-md bg-lime-300 px-4 text-[11px] font-black text-emerald-950 hover:bg-lime-200 sm:inline-flex">Join the network</Link>}</div></div></header>;
}

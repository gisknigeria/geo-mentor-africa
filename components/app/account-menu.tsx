"use client";

import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase/client";

export function AccountMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user);
        setReady(true);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return <span className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" aria-label="Checking sign-in status" />;
  }

  if (!user) {
    return <div className="flex items-center gap-1"><Link href="/auth" className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-white/15 px-3 text-xs font-bold text-white hover:bg-white/25"><LogIn className="size-4" />Sign in</Link></div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/portal" className="hidden rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-emerald-950 hover:bg-lime-200 lg:inline-flex">My portal</Link>
      <span className="hidden max-w-40 items-center gap-2 truncate rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white md:flex" title={user.email}><UserRound className="size-4 shrink-0" />{user.email}</span>
      <button type="button" onClick={() => void supabase.auth.signOut()} className="grid size-9 place-items-center rounded-lg text-white/75 hover:bg-white/15 hover:text-white" aria-label="Sign out"><LogOut className="size-4" /></button>
    </div>
  );
}

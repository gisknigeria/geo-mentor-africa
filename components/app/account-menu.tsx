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
    return <Link href="/auth" className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#0b4436] px-3 text-xs font-bold text-white hover:bg-[#0f5745]"><LogIn className="size-4" />Sign in</Link>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 items-center gap-2 truncate rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 md:flex" title={user.email}><UserRound className="size-4 shrink-0" />{user.email}</span>
      <button type="button" onClick={() => void supabase.auth.signOut()} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Sign out"><LogOut className="size-4" /></button>
    </div>
  );
}

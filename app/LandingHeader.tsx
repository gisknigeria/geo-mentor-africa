"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "../lib/supabase/client";
import { AccountMenu } from "../components/app/account-menu";
import { Logo } from "../components/app/logo";

const links = [
  { label: "Home", href: "/" },
  { label: "Biodiversity", href: "/observations" },
  { label: "School map", href: "/#map" },
  { label: "Programme & safety", href: "/pilot" },
  { label: "Partners", href: "/partner" },
];

export function LandingHeader() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);

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

  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="workspace-header sticky top-0 z-[1000] px-4 text-white sm:px-7">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-3">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Public navigation">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={active(link.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2.5 text-[11px] font-bold transition ${
                active(link.href)
                  ? "bg-white/12 text-lime-200"
                  : "text-emerald-100/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <AccountMenu />
          {ready && !signedIn && (
            <Link
              href="/register"
              className="hidden min-h-10 items-center rounded-lg bg-lime-300 px-4 text-[11px] font-black text-white hover:bg-lime-400 sm:inline-flex"
            >
              Join
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-lg bg-white/10 lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="mx-auto grid max-w-[1440px] gap-1 border-t border-white/10 py-3 lg:hidden"
          aria-label="Mobile public navigation"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={active(link.href) ? "page" : undefined}
              className={`rounded-lg px-4 py-3 text-sm font-bold ${
                active(link.href)
                  ? "bg-lime-300 text-white"
                  : "text-emerald-50/80 hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {ready && !signedIn && (
            <Link href="/register" className="mt-1 rounded-lg bg-white/10 px-4 py-3 text-sm font-bold text-lime-200 sm:hidden">
              Join the network
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

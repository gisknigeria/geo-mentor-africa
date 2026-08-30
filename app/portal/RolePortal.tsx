"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, Binoculars, Building2, CheckCircle2, GraduationCap, Handshake, Leaf, LogOut, ShieldAlert, Sparkles, UserRoundCheck } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { supabase } from "../../lib/supabase/client";

type Membership = { organization_id: string; role: string; status: string; organizationName?: string };
type Application = { application_type: string; status: string; organization_name: string | null };
type PortalData = { memberships: Membership[]; applications: Application[] };

const workspaces = {
  STUDENT: { title: "Student fieldwork", description: "Capture observations and follow your school’s biodiversity projects.", href: "/student", icon: GraduationCap, tone: "bg-lime-100 text-lime-800" },
  TEACHER: { title: "Teacher review", description: "Check student evidence before scientific validation.", href: "/teacher", icon: UserRoundCheck, tone: "bg-amber-100 text-amber-800" },
  SCHOOL_ADMIN: { title: "School operations", description: "Manage student access, consent, reviews and school progress.", href: "/school", icon: Building2, tone: "bg-emerald-100 text-emerald-800" },
  MENTOR: { title: "Mentor workspace", description: "Guide assigned schools and support supervised field learning.", href: "/mentor", icon: Binoculars, tone: "bg-sky-100 text-sky-800" },
  EXPERT: { title: "Expert validation", description: "Verify biodiversity records after teacher review.", href: "/expert", icon: Leaf, tone: "bg-violet-100 text-violet-800" },
  PARTNER: { title: "Geo-Partner impact", description: "Support schools, campaigns and location-linked conservation goals.", href: "/partner", icon: Handshake, tone: "bg-teal-100 text-teal-800" },
  PLATFORM_ADMIN: { title: "Platform onboarding", description: "Review applications and administer trusted access.", href: "/admin/onboarding", icon: ShieldAlert, tone: "bg-rose-100 text-rose-800" },
} as const;

export function RolePortal() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [data, setData] = useState<PortalData>({ memberships: [], applications: [] });
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data: authData }) => {
      const currentUser = authData.user;
      setUser(currentUser);
      if (currentUser) {
        const [memberships, applications] = await Promise.all([
          supabase.from("organization_memberships").select("organization_id, role, status").eq("user_id", currentUser.id),
          supabase.from("registration_applications").select("application_type, status, organization_name").eq("applicant_user_id", currentUser.id).order("created_at", { ascending: false }),
        ]);
        if (!memberships.error) {
          const membershipRows = (memberships.data ?? []) as Membership[];
          const organizationIds = [...new Set(membershipRows.map((membership) => membership.organization_id))];
          const { data: organizations, error: organizationsError } = organizationIds.length
            ? await supabase.from("organizations").select("id, name").in("id", organizationIds)
            : { data: [], error: null };
          if (organizationsError) {
            setLoadError(true);
          } else {
            const names = new Map((organizations ?? []).map((organization) => [organization.id, organization.name]));
            setData({ memberships: membershipRows.map((membership) => ({ ...membership, organizationName: names.get(membership.organization_id) })), applications: applications.error ? [] : (applications.data ?? []) as Application[] });
          }
        } else {
          setLoadError(true);
          console.error("Unable to load account memberships", memberships.error);
        }
      }
      setAuthReady(true);
    });
  }, []);

  if (!authReady) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm font-semibold text-emerald-950">Checking your account and role…</main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Logo /><ShieldAlert className="mx-auto mt-9 size-9 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">Sign in to open your portal</h1><p className="mt-3 text-sm leading-6 text-slate-600">Your approved role determines which protected workspace you can access.</p><Link href="/auth" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#0b4436] px-5 text-xs font-bold text-white">Sign in securely</Link></section></main>;

  const verifiedRoles = data.memberships.filter((item) => item.status === "VERIFIED").map((item) => item.role);
  const visibleRoles = verifiedRoles;
  const pendingMemberships = data.memberships.filter((item) => item.status === "PENDING");
  const isPlatformAdmin = verifiedRoles.includes("PLATFORM_ADMIN");

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]"><header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-7"><div className="mx-auto flex max-w-6xl items-center justify-between"><Logo /><div className="flex items-center gap-3">{isPlatformAdmin && <span className="rounded-full bg-rose-100 px-3 py-1.5 text-[10px] font-black text-rose-800">PLATFORM ADMINISTRATOR</span>}<span className="hidden text-xs font-semibold text-slate-500 sm:block">{user.email}</span><button onClick={() => void supabase.auth.signOut().then(() => window.location.assign("/auth"))} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Sign out"><LogOut className="size-4" /></button></div></div></header><div className="mx-auto max-w-6xl px-4 py-8 sm:px-7"><section className="rounded-3xl bg-[radial-gradient(circle_at_90%_15%,rgba(202,230,105,.25),transparent_30%),linear-gradient(145deg,#174e3e,#0b392e)] p-7 text-white sm:p-10"><p className="text-[10px] font-black tracking-[.2em] text-lime-300">{isPlatformAdmin ? "PLATFORM ADMINISTRATOR ACCOUNT" : "YOUR GEOMENTOR AFRICA PORTAL"}</p><h1 className="mt-3 max-w-3xl font-serif text-4xl sm:text-5xl">{isPlatformAdmin ? "You are signed in as the platform administrator." : "Your verified workspace is ready."}</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/75">{isPlatformAdmin ? "Review applications, approve trusted participants and activate controlled school access from the onboarding workspace below." : "GeoMentor shows only the workspaces assigned to your verified account."}</p></section>{loadError && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs leading-5 text-rose-900">We could not read your verified role. Check the Supabase migration and Row-Level Security setup, then sign in again.</div>}<section className="mt-7"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black tracking-[.16em] text-emerald-700">AVAILABLE WORKSPACES</p><h2 className="mt-1 font-serif text-3xl text-emerald-950">Continue your work</h2></div><span className="hidden items-center gap-1 text-[10px] font-bold text-emerald-700 sm:flex"><CheckCircle2 className="size-4" />Role verified</span></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleRoles.map((role) => { const workspace = workspaces[role as keyof typeof workspaces]; if (!workspace) return null; const Icon = workspace.icon; return <Link key={role} href={workspace.href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"><span className={`grid size-12 place-items-center rounded-xl ${workspace.tone}`}><Icon className="size-5" /></span><h3 className="mt-5 font-serif text-2xl text-emerald-950">{workspace.title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{workspace.description}</p><span className="mt-5 flex items-center gap-1 text-xs font-bold text-emerald-800">Open workspace <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span></Link>; })}</div>{visibleRoles.length === 0 && !loadError && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-7"><Sparkles className="size-7 text-amber-600" /><h3 className="mt-4 font-serif text-2xl text-emerald-950">Your account is signed in, but no role is active yet</h3><p className="mt-2 text-sm leading-6 text-slate-600">An administrator must approve your role before a protected workspace appears.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/join" className="rounded-lg bg-[#0b4436] px-4 py-3 text-xs font-bold text-white">Join with class code</Link><Link href="/register" className="rounded-lg bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">Apply to join</Link><Link href="/invite" className="rounded-lg bg-slate-100 px-4 py-3 text-xs font-bold text-slate-700">Accept invitation</Link></div></div>}</section>{(pendingMemberships.length > 0 || data.applications.length > 0) && <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><p className="text-[10px] font-black tracking-[.16em] text-slate-400">ACCESS STATUS</p><h2 className="mt-1 font-serif text-2xl text-emerald-950">Applications and approvals</h2><div className="mt-4 grid gap-2">{pendingMemberships.map((item, index) => <div key={`${item.role}-${index}`} className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3 text-xs"><strong>{item.role.replaceAll("_", " ")}</strong><span className="font-bold text-amber-800">Awaiting approval</span></div>)}{data.applications.map((item, index) => <div key={`${item.application_type}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-xs"><strong>{item.organization_name || item.application_type}</strong><span className="font-bold text-slate-600">{item.status}</span></div>)}</div></section>}</div></main>;
}

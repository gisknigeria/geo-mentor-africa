"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, CheckCircle2, ClipboardCheck, FolderKanban, Leaf, ShieldAlert, UserCheck, Users } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { AccountMenu } from "../../components/app/account-menu";
import { supabase } from "../../lib/supabase/client";

type Observation = { id: string; observation_type: string; common_name: string | null; scientific_name: string | null; verification_status: string; review_stage: string; observed_at: string; sensitivity_level: string; latitude: number | null; longitude: number | null };
type Dashboard = { school: { id: string; name: string; country_code: string }; role: string; metrics: { verified_students: number; pending_students: number; teacher_review: number; expert_review: number; verified_observations: number; active_projects: number }; recent_observations: Observation[] };

const stageLabel: Record<string, string> = { TEACHER_REVIEW: "Teacher review", EXPERT_REVIEW: "Expert review", STUDENT_REVISION: "Student revision", CLOSED: "Closed" };

export function SchoolOperations() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_school_operations_dashboard");
    if (error || !data) setLoadError(error?.message || "The school dashboard returned no data.");
    else setDashboard(data as Dashboard);
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) await loadDashboard();
      setAuthReady(true);
    });
  }, [loadDashboard]);

  if (authReady && !user) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">School staff sign-in required</h1><p className="mt-3 text-sm text-slate-600">This workspace is restricted to verified teachers and school administrators.</p><Link href="/auth" className="mt-5 inline-block text-sm font-bold text-emerald-800">Sign in securely</Link></section></main>;
  if (!authReady || !dashboard) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">School data unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-600">{loadError || "Loading your live school dashboard..."}</p><Link href="/portal" className="mt-5 inline-block text-sm font-bold text-emerald-800">Return to portal</Link></section></main>;

  const metrics = [
    ["Verified students", dashboard.metrics.verified_students, Users, "bg-violet-100 text-violet-700"],
    ["Pending consent", dashboard.metrics.pending_students, UserCheck, "bg-amber-100 text-amber-800"],
    ["Teacher review", dashboard.metrics.teacher_review, ClipboardCheck, "bg-lime-100 text-lime-800"],
    ["Verified records", dashboard.metrics.verified_observations, CheckCircle2, "bg-emerald-100 text-emerald-800"],
  ] as const;

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-7"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Logo /><div className="flex items-center gap-3"><span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-800 sm:block">{dashboard.role.replaceAll("_", " ")}</span><AccountMenu /></div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black tracking-[.18em] text-emerald-700">SCHOOL OPERATIONS</p><h1 className="mt-2 font-serif text-4xl text-emerald-950">{dashboard.school.name}</h1><p className="mt-2 text-sm text-slate-500">Student access, evidence review and biodiversity progress in one protected workspace.</p></div><Link href="/teacher" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0b4436] px-5 text-xs font-bold text-white">Open teacher queue <ArrowRight className="size-4" /></Link></section>
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label,value,Icon,tone]) => <article key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"><span className={`grid size-12 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span><div><small className="text-[9px] font-black tracking-[.12em] text-slate-400">{label.toUpperCase()}</small><strong className="mt-1 block font-serif text-3xl text-emerald-950">{value}</strong></div></article>)}</section>
      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.7fr)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><p className="text-[9px] font-black tracking-[.15em] text-slate-400">SCHOOL EVIDENCE</p><h2 className="mt-1 font-serif text-2xl text-emerald-950">Recent observations</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800">{dashboard.metrics.expert_review} with experts</span></div><div className="divide-y divide-slate-100">{dashboard.recent_observations.map((observation) => <div key={observation.id} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 p-4 sm:px-5"><span className="grid size-10 place-items-center rounded-xl bg-lime-100 text-emerald-800"><Leaf className="size-4" /></span><span className="min-w-0"><strong className="block truncate text-xs text-emerald-950">{observation.scientific_name || observation.common_name || observation.observation_type}</strong><small className="mt-1 block text-[10px] text-slate-400">{observation.observation_type} · {new Date(observation.observed_at).toLocaleDateString()}</small></span><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${observation.verification_status === "VERIFIED" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{stageLabel[observation.review_stage] || observation.verification_status}</span></div>)}</div></article>
        <aside className="grid gap-5"><article className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="relative h-52 bg-[linear-gradient(135deg,#e8eddc,#c6d7bd)]"><span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[9px] font-bold text-emerald-900">Sensitive records hidden</span></div><div className="p-5"><p className="text-[9px] font-black tracking-[.15em] text-slate-400">PRIVACY-SAFE MAP</p><h2 className="mt-1 font-serif text-xl">School biodiversity map</h2><p className="mt-2 text-xs leading-5 text-slate-500">Only approximate coordinates are returned here. Critical species locations are withheld.</p></div></article><article className="rounded-2xl bg-[#0b4436] p-5 text-white"><p className="text-[9px] font-black tracking-[.15em] text-emerald-100/70">QUICK ACTIONS</p><div className="mt-4 grid gap-2"><Link href="/teacher" className="flex items-center justify-between rounded-lg bg-lime-300 px-4 py-3 text-xs font-bold text-emerald-950">Open teacher queue <ClipboardCheck className="size-4" /></Link></div><div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-emerald-100/65"><FolderKanban className="size-4" />{dashboard.metrics.active_projects} active school projects</div></article></aside>
      </section>
    </div>
  </main>;
}

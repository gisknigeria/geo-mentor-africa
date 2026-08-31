"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Binoculars, CalendarDays, Check, ClipboardCheck, MapPin, Save, ShieldCheck, Users } from "lucide-react";
import { Logo } from "../../../../components/app/logo";
import { supabase } from "../../../../lib/supabase/client";

const themes = ["Plants & trees", "Pollinators", "Birds", "Soil & water", "Habitats", "Conservation actions"];
const storageKey = "geomentor-pilot-project-draft-v1";

type Draft = { title: string; className: string; learnerCount: string; startDate: string; duration: string; learningGoal: string; safeArea: string; safetyNotes: string; themes: string[]; mentorSupport: boolean; expertSupport: boolean };
const initialDraft: Draft = { title: "School Biodiversity Baseline", className: "", learnerCount: "", startDate: "", duration: "6", learningGoal: "Identify and map biodiversity within our school grounds.", safeArea: "School garden and supervised courtyard", safetyNotes: "Teacher checks the area before fieldwork. Students work in supervised groups.", themes: ["Plants & trees", "Pollinators"], mentorSupport: true, expertSupport: true };

export function ProjectSetup() {
  const [draft, setDraft] = useState(initialDraft);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) setDraft({ ...initialDraft, ...JSON.parse(saved) });
      } catch {
        // Ignore malformed device-local drafts and use the safe defaults.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const readiness = useMemo(() => [draft.title, draft.className, draft.learnerCount, draft.startDate, draft.learningGoal, draft.safeArea, draft.themes.length].filter(Boolean).length, [draft]);
  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })); setMessage(null); }
  function toggleTheme(theme: string) { update("themes", draft.themes.includes(theme) ? draft.themes.filter((item) => item !== theme) : [...draft.themes, theme]); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setMessage("Please sign in as a verified teacher before saving a project.");
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", authData.user.id)
      .eq("role", "TEACHER")
      .eq("status", "VERIFIED")
      .limit(1)
      .maybeSingle();
    if (membershipError || !membership) {
      setMessage("A verified teacher school membership is required to save this project.");
      return;
    }

    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id")
      .eq("organization_id", membership.organization_id)
      .limit(1)
      .maybeSingle();
    if (schoolError || !school) {
      setMessage("Your teacher school workspace is not configured yet.");
      return;
    }

    const description = [
      `Class: ${draft.className}`,
      `Learners: ${draft.learnerCount}`,
      `Start date: ${draft.startDate}`,
      `Duration: ${draft.duration} weeks`,
      `Learning goal: ${draft.learningGoal}`,
      `Approved area: ${draft.safeArea}`,
      `Safety notes: ${draft.safetyNotes}`,
      `Themes: ${draft.themes.join(", ")}`,
      `Mentor support: ${draft.mentorSupport ? "requested" : "not requested"}`,
      `Expert support: ${draft.expertSupport ? "requested" : "not requested"}`,
    ].join("\n");
    const { error: projectError } = await supabase.from("projects").insert({
      organization_id: membership.organization_id,
      school_id: school.id,
      title: draft.title,
      project_type: "BIODIVERSITY_BASELINE",
      description,
      status: "DRAFT",
      visibility: "SCHOOL",
      created_by: authData.user.id,
    });
    if (projectError) {
      setMessage(`Project could not be saved: ${projectError.message}`);
      return;
    }

    localStorage.removeItem(storageKey);
    setMessage("Project setup saved to your school workspace.");
  }

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
    <header className="border-b border-white/10 bg-[#0b4436] px-4 py-4 text-white sm:px-7"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Logo /><Link href="/teacher" className="rounded-lg bg-white/10 px-4 py-2.5 text-xs font-bold">Teacher review</Link></div></header>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><Link href="/teacher" className="text-xs font-bold text-emerald-800">← Teacher workspace</Link><p className="mt-7 text-[10px] font-black tracking-[.18em] text-emerald-700">NEW PILOT PROJECT</p><h1 className="mt-2 max-w-3xl font-serif text-4xl text-emerald-950 sm:text-5xl">Plan a safe first biodiversity project.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Set the learning goal, class, safe field boundary and review support before students begin.</p></div><div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4"><span className="text-[10px] font-black tracking-wider text-emerald-700">SETUP READINESS</span><strong className="mt-1 block font-serif text-2xl text-emerald-950">{readiness} of 7 essentials</strong></div></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"><form onSubmit={save} className="grid gap-5">
        <Section number="01" title="Project and class" icon={Users}><div className="grid gap-4 sm:grid-cols-2"><Field label="Project title"><input required maxLength={100} value={draft.title} onChange={(e) => update("title", e.target.value)} /></Field><Field label="Class or group"><input required maxLength={80} placeholder="e.g. JSS 2 Green" value={draft.className} onChange={(e) => update("className", e.target.value)} /></Field><Field label="Number of learners"><input required min="1" max="100" type="number" placeholder="25" value={draft.learnerCount} onChange={(e) => update("learnerCount", e.target.value)} /></Field><Field label="Project duration"><select value={draft.duration} onChange={(e) => update("duration", e.target.value)}><option value="4">4 weeks</option><option value="6">6 weeks</option><option value="8">8 weeks</option><option value="12">12 weeks</option></select></Field></div></Section>
        <Section number="02" title="First lesson" icon={CalendarDays}><div className="grid gap-4 sm:grid-cols-2"><Field label="Target start date"><input required type="date" value={draft.startDate} onChange={(e) => update("startDate", e.target.value)} /></Field><Field label="Learning goal"><textarea required maxLength={300} value={draft.learningGoal} onChange={(e) => update("learningGoal", e.target.value)} /></Field></div></Section>
        <Section number="03" title="Safe field area" icon={ShieldCheck}><div className="grid gap-4 sm:grid-cols-2"><Field label="Approved observation area"><textarea required maxLength={300} value={draft.safeArea} onChange={(e) => update("safeArea", e.target.value)} /></Field><Field label="Safety and accessibility notes"><textarea required maxLength={500} value={draft.safetyNotes} onChange={(e) => update("safetyNotes", e.target.value)} /></Field></div><div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950"><MapPin className="mt-0.5 size-5 shrink-0" /><span><strong>Privacy-safe boundary:</strong> exact student and sensitive-species locations remain restricted.</span></div></Section>
        <Section number="04" title="Observation and review support" icon={Binoculars}><fieldset><legend className="text-xs font-bold text-slate-700">Observation themes</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{themes.map((theme) => <label key={theme} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs font-bold ${draft.themes.includes(theme) ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-600"}`}><input className="sr-only" type="checkbox" checked={draft.themes.includes(theme)} onChange={() => toggleTheme(theme)} /><span className={`grid size-5 place-items-center rounded ${draft.themes.includes(theme) ? "bg-emerald-700 text-white" : "border border-slate-300"}`}>{draft.themes.includes(theme) && <Check className="size-3" />}</span>{theme}</label>)}</div></fieldset><div className="mt-5 grid gap-3 sm:grid-cols-2"><Toggle checked={draft.mentorSupport} onChange={(value) => update("mentorSupport", value)} title="Request mentor guidance" text="Structured support for the teacher and project." /><Toggle checked={draft.expertSupport} onChange={(value) => update("expertSupport", value)} title="Request expert validation" text="Scientific review after the teacher quality gate." /></div></Section>
        {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{message}</div>}<div className="flex justify-end"><button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0b4436] px-6 text-xs font-black text-white"><Save className="size-4" />Save project setup</button></div>
      </form><aside className="lg:sticky lg:top-6 lg:self-start"><article className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="bg-[radial-gradient(circle_at_80%_10%,rgba(202,230,105,.22),transparent_30%),linear-gradient(145deg,#0b4436,#153b31)] p-6 text-white"><ClipboardCheck className="size-7 text-lime-300" /><p className="mt-5 text-[9px] font-black tracking-[.16em] text-lime-200">PROJECT PREVIEW</p><h2 className="mt-2 font-serif text-3xl">{draft.title || "Untitled project"}</h2><p className="mt-3 text-xs leading-5 text-emerald-50/70">{draft.learningGoal || "Add a learning goal."}</p></div><div className="grid gap-4 p-6 text-xs"><Summary label="CLASS" value={draft.className || "Not selected"} /><Summary label="START" value={draft.startDate || "Not scheduled"} /><Summary label="SAFE AREA" value={draft.safeArea || "Not defined"} /><Summary label="THEMES" value={draft.themes.join(", ") || "None selected"} /><div className="border-t border-slate-200 pt-4"><strong className="text-emerald-900">Teacher review comes first</strong><p className="mt-2 leading-5 text-slate-500">Student observations stay in the school quality gate before expert validation.</p></div></div></article><p className="mt-3 rounded-xl bg-amber-50 p-4 text-[10px] leading-5 text-amber-900">Drafts are stored only on this device until Supabase project tables are activated.</p></aside></div>
    </div>
  </main>;
}

function Section({ number, title, icon: Icon, children }: { number: string; title: string; icon: typeof Users; children: ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-lime-100 text-emerald-800"><Icon className="size-5" /></span><div><p className="text-[9px] font-black tracking-[.16em] text-emerald-700">STEP {number}</p><h2 className="mt-1 font-serif text-2xl text-emerald-950">{title}</h2></div></div>{children}</section>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-2 text-xs font-bold text-slate-700"><span>{label}</span><span className="[&>input]:h-11 [&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-slate-300 [&>input]:px-3 [&>select]:h-11 [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-slate-300 [&>select]:px-3 [&>textarea]:min-h-24 [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-slate-300 [&>textarea]:p-3 [&>*]:font-normal [&>*]:outline-none focus-within:[&>*]:border-emerald-600">{children}</span></label>; }
function Toggle({ checked, onChange, title, text }: { checked: boolean; onChange: (value: boolean) => void; title: string; text: string }) { return <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4"><input aria-label={title} type="checkbox" className="mt-1 size-4 accent-emerald-700" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span><strong className="block text-xs text-emerald-950">{title}</strong><small className="mt-1 block text-[10px] leading-4 text-slate-500">{text}</small></span></label>; }
function Summary({ label, value }: { label: string; value: string }) { return <div><small className="block text-[9px] font-black tracking-wider text-slate-400">{label}</small><strong className="mt-1 block leading-5 text-emerald-950">{value}</strong></div>; }

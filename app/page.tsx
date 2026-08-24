import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell, Binoculars, CalendarDays, CheckCircle2, ChevronRight, CircleHelp,
  ClipboardCheck, FolderKanban, LayoutDashboard, Leaf, Map, MapPin,
  Plus, ScanLine, Sprout, TreePine, Users,
} from "lucide-react";
import { Logo } from "../components/app/logo";
import { AccountMenu } from "../components/app/account-menu";
import { Badge } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/utils";

export const metadata: Metadata = {
  title: "School fieldwork | GeoMentor Africa",
  description: "A secure field learning and biodiversity platform for African schools.",
};

const navigation = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard, active: true },
  { label: "Field capture", href: "/field", icon: ScanLine },
  { label: "School map", href: "#map", icon: Map },
  { label: "Projects", href: "#projects", icon: FolderKanban },
  { label: "My submissions", href: "#reviews", icon: ClipboardCheck },
];

const stats = [
  { label: "Verified species", value: "38", note: "+6 this term", icon: Leaf, tone: "bg-lime-100 text-lime-800" },
  { label: "Trees mapped", value: "124", note: "91% surviving", icon: TreePine, tone: "bg-emerald-100 text-emerald-800" },
  { label: "Student observers", value: "47", note: "12 active today", icon: Users, tone: "bg-violet-100 text-violet-700" },
  { label: "Awaiting review", value: "7", note: "Usually under 24h", icon: ClipboardCheck, tone: "bg-amber-100 text-amber-800" },
];

const observations = [
  { species: "African tulip tree", kind: "Tree", status: "Expert verified", time: "Today, 10:42", icon: TreePine, tone: "bg-lime-100 text-lime-800", badge: "bg-emerald-50 text-emerald-800" },
  { species: "Plain tiger", kind: "Pollinator", status: "Teacher review", time: "Yesterday, 15:18", icon: Binoculars, tone: "bg-amber-100 text-amber-800", badge: "bg-amber-50 text-amber-800" },
  { species: "Neem", kind: "Tree", status: "AI suggested", time: "Yesterday, 11:06", icon: Sprout, tone: "bg-emerald-100 text-emerald-800", badge: "bg-violet-50 text-violet-700" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f6f1] text-[#15342d] lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0b4436] px-5 py-7 text-white lg:flex">
        <Logo />
        <nav className="mt-12 grid gap-1.5" aria-label="Primary navigation">
          {navigation.map(({ label, href, icon: Icon, active }) => (
            <Link key={label} href={href} className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-emerald-100/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-300/20", active && "bg-lime-50 text-emerald-950 hover:bg-lime-50 hover:text-emerald-950")}>
              <Icon className="size-[18px]" aria-hidden="true" />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/[.07] p-4">
          <p className="text-[10px] font-bold tracking-[.18em] text-emerald-100/65">FIELD GOAL</p>
          <p className="mt-2 text-sm font-semibold">12 of 20 observations</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><span className="block h-full w-3/5 rounded-full bg-lime-300" /></div>
          <p className="mt-2 text-xs text-emerald-100/65">8 more this term</p>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
          <span className="grid size-10 place-items-center rounded-full bg-lime-200 text-xs font-black text-emerald-950">AO</span>
          <span className="grid gap-0.5"><strong className="text-xs">Amina O.</strong><small className="text-[10px] text-emerald-100/60">Student · Green Club</small></span>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="lg:hidden"><Logo compact /></div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="grid size-9 place-items-center rounded-lg bg-lime-100 text-[10px] font-black text-emerald-900">SS</span>
            <span className="grid gap-0.5"><small className="text-[9px] font-bold tracking-[.14em] text-slate-400">YOUR SCHOOL</small><strong className="text-xs">Staff School, Ibadan</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link className="hidden rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 sm:block" href="/teacher">Teacher</Link>
            <Link className="hidden rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 sm:block" href="/mentor">Mentor</Link>
            <Link className="hidden rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 sm:block" href="/expert">Expert</Link>
            <button className="relative grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-orange-500" /></button>
            <button className="hidden min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 md:flex"><CircleHelp className="size-4" />Need help?</button>
            <AccountMenu />
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 pb-24 sm:px-7 lg:px-9" id="overview">
          <section className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-bold tracking-[.18em] text-slate-400">MONDAY · 24 AUGUST</p><h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-emerald-950 sm:text-5xl">Good morning, Amina.</h1><p className="mt-2 text-sm text-slate-500">Your school’s living map is growing. What will you discover today?</p></div>
            <Link href="/field" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}><Plus className="size-4" />Record an observation</Link>
          </section>

          <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="School impact summary">
            {stats.map(({ label, value, note, icon: Icon, tone }) => <article key={label} className="flex min-h-24 items-center gap-3.5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_3px_14px_rgba(27,55,47,.035)]"><span className={cn("grid size-11 shrink-0 place-items-center rounded-full", tone)}><Icon className="size-5" /></span><div><small className="text-[9px] font-bold tracking-[.12em] text-slate-400">{label.toUpperCase()}</small><div className="mt-0.5 flex items-baseline gap-2"><strong className="font-serif text-3xl font-medium text-emerald-950">{value}</strong><span className="text-[10px] text-slate-500">{note}</span></div></div></article>)}
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,.75fr)]">
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white" id="map">
              <div className="flex items-center justify-between px-5 py-4"><div><p className="text-[9px] font-bold tracking-[.15em] text-slate-400">STAFF SCHOOL BIODIVERSITY GARDEN</p><h2 className="mt-1 font-serif text-xl text-emerald-950">Your living school map</h2></div><a href="#map" className="flex items-center gap-1 text-xs font-bold text-emerald-800">Explore map <ChevronRight className="size-4" /></a></div>
              <div className="map-canvas" role="img" aria-label="Map showing the biodiversity garden, trees and recent observations"><span className="road road-one" /><span className="road road-two" /><span className="road road-three" /><span className="garden-shape"><small>Biodiversity<br />garden</small></span><span className="map-pin pin-one">♧</span><span className="map-pin pin-two">♧</span><span className="map-pin pin-three">⌁</span><span className="map-pin pin-four">♧</span><span className="map-label label-one">Main school</span><span className="map-label label-two">Sports field</span><div className="map-legend"><span><i className="legend-tree" />Trees</span><span><i className="legend-observation" />Observations</span><span><i className="legend-garden" />Garden</span></div></div>
            </article>

            <aside className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-lime-50/60 p-5">
              <p className="text-[9px] font-bold tracking-[.15em] text-slate-400">YOUR GEOMENTOR</p>
              <div className="mt-4 flex items-center gap-3"><span className="grid size-14 place-items-center rounded-full border-4 border-white bg-lime-100 text-xs font-black text-emerald-900 shadow-sm">KA</span><div><h2 className="text-sm font-bold">Dr. Kemi Adeyemi</h2><p className="mt-0.5 text-[10px] text-slate-500">Ecology & Conservation</p><Badge className="mt-1 px-0 py-0"><CheckCircle2 className="size-3" />Verified mentor</Badge></div></div>
              <blockquote className="mt-5 rounded-r-lg border-l-4 border-lime-500 bg-lime-50 p-4 font-serif text-xs italic leading-relaxed text-slate-600">“This week, look closely at flowering plants near the garden edge. Pollinators are most active before noon.”</blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4"><span className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-800"><CalendarDays className="size-5" /></span><span><small className="text-[9px] font-bold tracking-[.12em] text-slate-400">NEXT GROUP SESSION</small><strong className="mt-0.5 block text-[11px]">Reading the garden as a habitat</strong><em className="mt-0.5 block text-[10px] not-italic text-slate-500">Friday · 10:00 AM</em></span></div>
              <Link href="/mentor" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-5 w-full")}>View mentoring space</Link>
            </aside>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,.75fr)]" id="reviews">
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between px-5 py-4"><div><p className="text-[9px] font-bold tracking-[.15em] text-slate-400">YOUR FIELDWORK</p><h2 className="mt-1 font-serif text-xl">Recent observations</h2></div><a href="#reviews" className="flex items-center text-xs font-bold text-emerald-800">View all <ChevronRight className="size-4" /></a></div><div className="px-5 pb-3">{observations.map(({ species, kind, status, time, icon: Icon, tone, badge }) => <div className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 border-t border-slate-100 py-3" key={species}><span className={cn("grid size-10 place-items-center rounded-lg", tone)}><Icon className="size-[18px]" /></span><span><strong className="block text-xs">{species}</strong><small className="mt-1 block text-[10px] text-slate-400">{kind} · {time}</small></span><Badge className={badge}><span className="size-1.5 rounded-full bg-current" />{status}</Badge></div>)}</div></article>
            <article className="rounded-xl bg-[radial-gradient(circle_at_88%_5%,rgba(197,222,104,.26),transparent_30%),linear-gradient(145deg,#194e3e,#0d392e)] p-6 text-white" id="field"><p className="text-[9px] font-bold tracking-[.15em] text-emerald-100/70">THIS WEEK’S FIELD MISSION</p><h2 className="mt-3 font-serif text-2xl">Find a pollinator at work</h2><p className="mt-3 text-xs leading-relaxed text-emerald-50/75">Photograph a bee, butterfly or beetle visiting a flower. Keep a respectful distance.</p><div className="mt-5 flex gap-2"><Badge className="bg-white/10 text-emerald-50">+15 field points</Badge><Badge className="bg-white/10 text-emerald-50">Due Friday</Badge></div><Link href="/field" className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-lime-300">Start mission <ChevronRight className="size-4" /></Link></article>
          </section>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/10 bg-[#0b4436] px-3 py-2 text-emerald-100 lg:hidden" aria-label="Mobile navigation">
          <a href="#overview" className="grid justify-items-center gap-1 p-1 text-[9px]"><LayoutDashboard className="size-5" />Home</a><Link href="/field" className="grid justify-items-center gap-1 p-1 text-[9px]"><Plus className="size-5" />Capture</Link><a href="#map" className="grid justify-items-center gap-1 p-1 text-[9px]"><MapPin className="size-5" />Map</a><a href="#reviews" className="grid justify-items-center gap-1 p-1 text-[9px]"><ClipboardCheck className="size-5" />Records</a>
        </nav>
      </div>
    </div>
  );
}

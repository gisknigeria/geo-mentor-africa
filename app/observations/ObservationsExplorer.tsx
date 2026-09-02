"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Bird, Clock3, Leaf, MapPin, Microscope, School, Search, ShieldCheck } from "lucide-react";
import { LandingHeader } from "../LandingHeader";
import { PublicObservationMap } from "./PublicObservationMap";

type Category = "All" | "Plants" | "Animals" | "Microbial";
type Review = { decision: string; scientificName: string | null; note: string; date: string };
type RecordItem = {
  id: string; common: string; scientific: string; category: Exclude<Category, "All">;
  school: string; place: string; date: string; note: string; latitude: number; longitude: number;
  schoolId: string | null; schoolLatitude: number | null; schoolLongitude: number | null;
  status: string; hasEvidence: boolean; review: Review | null;
};

const categoryIcon = { Plants: Leaf, Animals: Bird, Microbial: Microscope };

export function ObservationsExplorer() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/public/observations", { signal: controller.signal, cache: "no-store" })
      .then(async response => { if (!response.ok) throw new Error(); return response.json() as Promise<{ records: RecordItem[] }>; })
      .then(({ records: liveRecords = [] }) => { setRecords(liveRecords); setSelected(liveRecords[0]?.id ?? null); })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => records.filter(record => (category === "All" || record.category === category) && `${record.common} ${record.scientific} ${record.school}`.toLowerCase().includes(query.toLowerCase())), [records, category, query]);
  const active = records.find(record => record.id === selected) ?? records[0] ?? null;
  const verifiedCount = records.filter(record => record.status === "VERIFIED").length;
  const schoolPoints = useMemo(() => Array.from(new Map(records.flatMap(record => record.schoolId && record.schoolLatitude !== null && record.schoolLongitude !== null ? [[record.schoolId, { id: record.schoolId, label: record.school, latitude: record.schoolLatitude, longitude: record.schoolLongitude }] as const] : [])).values()), [records]);

  return <main className="min-h-screen bg-[#f2f3ed] text-[#17332c]">
    <LandingHeader />
    <section className="border-b border-slate-200 bg-white px-4 py-12 sm:px-7"><div className="mx-auto max-w-[1500px]"><p className="workspace-eyebrow">PUBLIC BIODIVERSITY COMMONS</p><div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="workspace-title text-5xl sm:text-6xl">Evidence, not just identifications.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Explore real biodiversity captures from the current platform and the historical Esri programme. The map shows privacy-safe capture points and the schools responsible for the records.</p></div><div className="flex gap-2"><span className="rounded-xl bg-[#f2f3ed] px-5 py-3 text-center"><b className="block font-serif text-2xl">{loading ? "—" : records.length.toLocaleString()}</b><small className="text-[8px] font-black text-slate-400">PUBLISHED FIELD RECORDS</small></span><span className="rounded-xl bg-emerald-50 px-5 py-3 text-center"><b className="block font-serif text-2xl text-emerald-950">{loading ? "—" : verifiedCount.toLocaleString()}</b><small className="text-[8px] font-black text-emerald-700">HUMAN VERIFIED</small></span><Link href="/field" className="inline-flex items-center rounded-xl bg-lime-300 px-4 py-3 text-[10px] font-black text-white">Add observation</Link></div></div></div></section>
    <section className="px-4 py-6 sm:px-7"><div className="mx-auto max-w-[1500px]">
      {unavailable ? <div className="workspace-card p-8 text-center text-sm text-amber-900">Live biodiversity records are temporarily unavailable.</div> : loading ? <div className="workspace-card p-12 text-center text-sm text-slate-500">Loading biodiversity records from Supabase…</div> : records.length === 0 ? <div className="workspace-card p-12 text-center"><Leaf className="mx-auto size-8 text-emerald-700" /><h2 className="mt-4 font-serif text-2xl text-emerald-950">No public observations yet</h2><p className="mt-2 text-sm text-slate-500">Captured records will appear here when a school publishes them.</p></div> : <>
        <div className="workspace-card grid overflow-hidden lg:grid-cols-[1.45fr_.55fr]"><div className="relative min-h-[420px]"><PublicObservationMap points={records.map(record => ({ id: record.id, label: record.common, latitude: record.latitude, longitude: record.longitude, category: record.category }))} schools={schoolPoints} selectedId={selected} onSelect={setSelected} /><div className="absolute bottom-4 left-4 z-[500] flex flex-wrap gap-3 rounded-lg bg-white/90 px-3 py-2 text-[9px] font-bold text-slate-600 shadow"><span><i className="mr-1 inline-block size-2 rounded-full bg-emerald-700" />Biodiversity capture</span><span><i className="mr-1 inline-block size-2 rounded-full bg-blue-600" />School</span><span><ShieldCheck className="mr-1 inline size-3.5 text-emerald-700" />Coordinates rounded for privacy</span></div></div>{active && <aside className="p-6"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[9px] font-black ${active.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{active.status === "VERIFIED" ? <BadgeCheck className="size-3" /> : <Clock3 className="size-3" />}{active.status === "VERIFIED" ? "HUMAN VERIFIED" : "AWAITING HUMAN REVIEW"}</span><p className="mt-5 text-[9px] font-black tracking-[.15em] text-slate-400">{active.place || "Location protected"} · {new Date(active.date).toLocaleDateString()}</p><h2 className="mt-2 font-serif text-3xl text-emerald-950">{active.common}</h2><p className="mt-1 text-xs italic text-slate-500">{active.scientific}</p><p className="mt-5 text-xs leading-6 text-slate-600">{active.note}</p><div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-[10px]"><span className="flex items-center gap-2"><MapPin className="size-4 text-emerald-700" /><span><small className="block text-slate-400">Capture location</small><b>{active.latitude.toFixed(3)}, {active.longitude.toFixed(3)}</b></span></span><span className="flex items-center gap-2"><School className="size-4 text-blue-600" /><span><small className="block text-slate-400">School location</small><b>{active.school}</b></span></span></div><div className="mt-6 border-t border-slate-100 pt-5 text-[10px]"><span className="text-slate-400">Published by</span><strong className="block text-emerald-950">{active.school}</strong></div>{active.review && <div className="mt-5 rounded-xl bg-emerald-50 p-4"><p className="text-[8px] font-black tracking-[.14em] text-emerald-700">LATEST VERIFIED REVIEW</p><p className="mt-2 text-[11px] leading-5 text-slate-600">{active.review.note}</p><time className="mt-2 block text-[9px] text-slate-400" dateTime={active.review.date}>{new Date(active.review.date).toLocaleDateString()}</time></div>}</aside>}</div>
        <div className="mt-6 flex flex-col justify-between gap-3 lg:flex-row"><label className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 lg:w-[360px]"><Search className="size-4 text-slate-400" /><input value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="Search species or school" /></label><div className="flex flex-wrap gap-2">{(["All", "Plants", "Animals", "Microbial"] as Category[]).map(item => <button key={item} onClick={() => setCategory(item)} className={`rounded-lg px-4 py-3 text-[10px] font-black ${category === item ? "bg-emerald-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{item}</button>)}</div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(record => { const Icon = categoryIcon[record.category]; const verified = record.status === "VERIFIED"; return <button type="button" key={record.id} onClick={() => setSelected(record.id)} className={`workspace-card overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-lg ${selected === record.id ? "ring-2 ring-emerald-700" : ""}`}><div className="relative grid h-36 place-items-center bg-gradient-to-br from-[#173f32] to-[#79905a] text-white"><Icon className="size-12 text-lime-200" />{record.hasEvidence && <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[8px] font-black text-emerald-950">APPROVED EVIDENCE ATTACHED</span>}</div><div className="p-5"><span className={`rounded-full px-2.5 py-1.5 text-[8px] font-black ${verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{verified ? "HUMAN VERIFIED" : "AWAITING REVIEW"}</span><h3 className="mt-4 font-serif text-2xl text-emerald-950">{record.common}</h3><p className="mt-1 text-[10px] italic text-slate-400">{record.scientific}</p><div className="mt-5 border-t border-slate-100 pt-4 text-[9px]"><b className="block text-emerald-950">{record.school}</b><small className="text-slate-400">{record.place || "Location protected"}</small><small className="mt-1 flex items-center gap-1 text-emerald-700"><MapPin className="size-3" />{record.latitude.toFixed(3)}, {record.longitude.toFixed(3)}</small></div></div></button>; })}</div>
        {filtered.length === 0 && <div className="workspace-card mt-5 border-dashed p-12 text-center text-sm text-slate-500">No published records match this search.</div>}
      </>}
    </div></section>
  </main>;
}

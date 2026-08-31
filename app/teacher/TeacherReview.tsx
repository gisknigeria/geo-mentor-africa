"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Camera, CheckCircle2, ClipboardCheck, MapPin, ShieldAlert } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase/client";

type Observation = { id: string; observation_type: string; common_name: string | null; notes: string; observed_at: string; coordinate_accuracy_m: number | null; latitude: number | null; longitude: number | null; school?: { name?: string } | null; observation_media?: Array<{ storage_path: string }> };

export function TeacherReview() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [records, setRecords] = useState<Observation[]>([]);
  const preview = false;
  const [selected, setSelected] = useState(0);
  const [decision, setDecision] = useState("SUBMIT_TO_EXPERT");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const record = records[selected] ?? null;

  const loadQueue = useCallback(async () => {
    const { data, error } = await supabase.from("observations").select("id, observation_type, common_name, notes, observed_at, coordinate_accuracy_m, location, schools(name), observation_media(storage_path)").eq("review_stage", "TEACHER_REVIEW").eq("verification_status", "PENDING").order("created_at");
    if (!error) {
      setRecords((data ?? []).map((item) => {
        const match = typeof item.location === "string" ? item.location.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i) : null;
        return { ...item, school: Array.isArray(item.schools) ? item.schools[0] : item.schools, latitude: match ? Number(match[2]) : null, longitude: match ? Number(match[1]) : null };
      }) as Observation[]);
      setSelected(0);
    }
  }, []);

  useEffect(() => { void supabase.auth.getUser().then(async ({ data }) => { setUser(data.user); if (data.user) await loadQueue(); setAuthReady(true); }); }, [loadQueue]);

  useEffect(() => {
    let active = true;
    const path = record?.observation_media?.[0]?.storage_path;
    void Promise.resolve(!path ? null : supabase.storage.from("observation-evidence").createSignedUrl(path, 600))
      .then((result) => { if (active) setEvidenceUrl(result?.data?.signedUrl ?? null); });
    return () => { active = false; };
  }, [record]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record) return;
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.rpc("review_observation_as_teacher", { target_observation: record.id, teacher_decision: decision, review_notes: notes.trim() });
    setMessage(error ? "The review could not be saved. Confirm your teacher role and the review-workflow migration." : decision === "SUBMIT_TO_EXPERT" ? "Observation submitted to the expert validation queue." : "Student observation status updated.");
    if (!error) { setNotes(""); await loadQueue(); }
    setBusy(false);
  }

  if (authReady && !user) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">Teacher sign-in required</h1><p className="mt-3 text-sm text-slate-600">Only verified school staff can review student evidence.</p><Link href="/auth" className="mt-5 inline-block text-sm font-bold text-emerald-800">Sign in securely</Link></section></main>;

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]"><header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-7"><div className="mx-auto flex max-w-7xl items-center justify-between"><Logo /><span className="rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-800">TEACHER REVIEW</span></div></header><div className="mx-auto grid max-w-7xl gap-5 px-4 py-7 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-7"><aside className="rounded-2xl border border-slate-200 bg-white p-5"><Link href="/" className="text-xs font-bold text-emerald-800">← Back to overview</Link><p className="mt-7 text-[10px] font-bold tracking-[.18em] text-emerald-700">EVIDENCE QUALITY GATE</p><h1 className="mt-2 font-serif text-3xl text-emerald-950">Teacher review queue</h1><p className="mt-2 text-xs leading-5 text-slate-500">Check safety, evidence and learning quality before an expert sees the record.</p>{preview && <div className="mt-4 rounded-lg bg-amber-50 p-3 text-[10px] leading-4 text-amber-900">Preview records are shown until a verified teacher signs in and migration 0005 is active.</div>}<div className="mt-5 grid gap-2">{records.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">No observations are awaiting teacher review.</p> : records.map((item, index) => <button key={item.id} type="button" onClick={() => { setSelected(index); setNotes(""); setMessage(null); }} className={`grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl border p-3 text-left ${selected === index ? "border-emerald-700 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}><span className="grid size-10 place-items-center rounded-lg bg-lime-100 text-emerald-800"><Camera className="size-4" /></span><span><strong className="block text-xs text-emerald-950">{item.common_name || item.observation_type}</strong><small className="mt-1 block text-[10px] text-slate-400">{item.observation_type} · {new Date(item.observed_at).toLocaleDateString()}</small></span><span className="text-emerald-700">→</span></button>)}</div></aside>
  <section className="min-w-0">{record ? <div className="grid gap-5"><article className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="grid min-h-64 place-items-center bg-[radial-gradient(circle_at_30%_30%,rgba(199,226,107,.35),transparent_28%),linear-gradient(145deg,#dfead2,#b5cba8)]">{evidenceUrl ? <img src={evidenceUrl} alt="Student biodiversity evidence" className="h-72 w-full object-cover" /> : <div className="text-center text-emerald-900"><Camera className="mx-auto size-10" /><strong className="mt-3 block text-sm">Student evidence image</strong><small className="mt-1 block text-xs opacity-65">Private until review</small></div>}</div><div className="grid gap-4 border-t border-slate-200 p-5 sm:grid-cols-4"><span><small className="block text-[9px] font-black tracking-wider text-slate-400">SCHOOL</small><strong className="mt-1 block text-xs">{record.school?.name || "Assigned school"}</strong></span><span><small className="block text-[9px] font-black tracking-wider text-slate-400">TYPE</small><strong className="mt-1 block text-xs">{record.observation_type}</strong></span><span><small className="block text-[9px] font-black tracking-wider text-slate-400">GPS QUALITY</small><strong className="mt-1 flex items-center gap-1 text-xs"><MapPin className="size-3" />±{Math.round(record.coordinate_accuracy_m || 0)} m</strong></span><span><small className="block text-[9px] font-black tracking-wider text-slate-400">OBSERVATION</small><strong className="mt-1 block truncate text-xs">{record.id}</strong></span></div></article><form onSubmit={submitReview} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex gap-3"><ClipboardCheck className="size-6 text-emerald-700" /><div><p className="text-[10px] font-bold tracking-[.18em] text-emerald-700">TEACHER DECISION</p><h2 className="mt-1 font-serif text-2xl text-emerald-950">Is the evidence ready?</h2></div></div><blockquote className="mt-5 rounded-r-lg border-l-4 border-lime-500 bg-lime-50 p-4 text-sm leading-6 text-slate-700">{record.notes}</blockquote><fieldset className="mt-5"><legend className="text-xs font-bold text-slate-700">Decision</legend><div className="mt-2 grid gap-3 sm:grid-cols-3">{[["SUBMIT_TO_EXPERT","Send to expert","Evidence is safe and useful"],["NEEDS_CHANGES","Needs changes","Student should improve it"],["REJECTED","Reject","Unsafe or unusable record"]].map(([value,label,help]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 ${decision === value ? "border-emerald-700 bg-emerald-50" : "border-slate-200"}`}><input className="sr-only" type="radio" name="decision" value={value} checked={decision === value} onChange={(event) => setDecision(event.target.value)} /><strong className="block text-xs">{label}</strong><small className="mt-1 block text-[10px] text-slate-500">{help}</small></label>)}</div></fieldset><label className="mt-5 grid gap-2 text-xs font-bold text-slate-700"><span>Feedback for the student and expert</span><textarea required minLength={3} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-28 rounded-lg border border-slate-300 p-3 text-sm font-normal" placeholder="Explain the evidence quality and any changes needed…" /></label>{message && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-900" role="status">{message}</div>}<div className="mt-5 flex justify-end"><Button type="submit" size="lg" disabled={busy}><CheckCircle2 className="size-4" />{busy ? "Saving review…" : "Save teacher decision"}</Button></div></form></div> : <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">The teacher queue is clear.</div>}</section></div></main>;
}

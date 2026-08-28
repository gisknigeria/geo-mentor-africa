"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase/client";

type Suggestion = { scientific_name: string | null; common_name: string | null; confidence: number | null };
type ExpertRecord = {
  id: string; observation_type: string; common_name: string | null; notes: string; observed_at: string; coordinate_accuracy_m: number | null;
  school?: { name?: string } | null; observation_media?: Array<{ storage_path: string }>; identification_suggestions?: Suggestion[];
};

function suggestionFor(record: ExpertRecord | null) { return record?.identification_suggestions?.[0] ?? null; }

export function ExpertReview() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [records, setRecords] = useState<ExpertRecord[]>([]);
  const preview = false;
  const [selected, setSelected] = useState(0);
  const [decision, setDecision] = useState("VERIFIED");
  const [scientificName, setScientificName] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const record = records[selected] ?? null;
  const suggestion = suggestionFor(record);
  const confidence = Math.round((suggestion?.confidence ?? 0) * 100);

  const loadQueue = useCallback(async () => {
    const { data, error } = await supabase.from("observations")
      .select("id, observation_type, common_name, notes, observed_at, coordinate_accuracy_m, schools(name), observation_media(storage_path), identification_suggestions(scientific_name, common_name, confidence)")
      .eq("review_stage", "EXPERT_REVIEW").eq("verification_status", "PENDING").order("created_at");
    if (!error) {
      const queue = (data ?? []).map((item) => ({ ...item, school: Array.isArray(item.schools) ? item.schools[0] : item.schools })) as ExpertRecord[];
      setRecords(queue); setSelected(0); setScientificName(suggestionFor(queue[0])?.scientific_name ?? "");
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

  function chooseRecord(index: number) {
    const nextRecord = records[index];
    setSelected(index); setScientificName(suggestionFor(nextRecord)?.scientific_name ?? ""); setDecision("VERIFIED"); setNotes(""); setMessage("");
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.rpc("review_observation_as_expert", { target_observation: record.id, expert_decision: decision, confirmed_scientific_name: scientificName.trim(), review_notes: notes.trim() });
    setMessage(error ? "The decision could not be saved. Confirm your expert verification and the review-workflow migration." : "Expert decision saved with an audit event.");
    if (!error) { setNotes(""); await loadQueue(); }
    setBusy(false);
  }

  if (authReady && !user) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-9 text-amber-600" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">Expert sign-in required</h1><p className="mt-3 text-sm text-slate-600">Only verified experts can validate student observations.</p><Link href="/auth" className="mt-5 inline-block text-sm font-bold text-emerald-800">Sign in securely</Link></section></main>;

  return <main className="expert-page"><header className="expert-header"><Logo /><div><span className="role-chip">Expert workspace</span><span className="expert-user">EX</span></div></header><div className="expert-layout"><aside className="review-queue"><Link className="back-link" href="/">← Back to overview</Link><span className="eyebrow">VALIDATION QUEUE</span><h1>Review observations</h1><p>AI suggestions remain unverified until an expert makes a decision.</p>{preview && <div className="mt-4 rounded-lg bg-amber-50 p-3 text-[10px] leading-4 text-amber-900">Preview records are shown until a verified expert signs in and migration 0005 is active.</div>}<Tabs defaultValue="pending" className="mt-5"><TabsList className="gap-5"><TabsTrigger value="pending">Pending <span className="ml-1 rounded-full bg-emerald-700 px-1.5 py-0.5 text-[9px] text-white">{records.length}</span></TabsTrigger><TabsTrigger value="reviewed">Reviewed</TabsTrigger></TabsList><TabsContent value="pending"><div className="queue-list">{records.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">No observations are awaiting expert validation.</p> : records.map((item, index) => { const itemSuggestion = suggestionFor(item); return <button type="button" className={selected === index ? "selected" : ""} onClick={() => chooseRecord(index)} key={item.id}><span className={`queue-thumb queue-${index % 3}`}>{item.observation_type === "POLLINATOR" ? "✦" : "♧"}</span><span><strong>{itemSuggestion?.scientific_name || item.common_name || "Identification pending"}</strong><small>{item.observation_type} · {item.school?.name || "Assigned school"}</small><em>{Math.round((itemSuggestion?.confidence ?? 0) * 100)}% AI confidence</em></span><i>→</i></button>; })}</div></TabsContent><TabsContent value="reviewed"><p className="rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">Reviewed observations remain protected with their decision and audit history.</p></TabsContent></Tabs></aside><section className="review-workspace">{record ? <><div className="evidence-card"><div className={`evidence-image evidence-${selected % 3}`}>{evidenceUrl ? <img src={evidenceUrl} alt="Private student biodiversity evidence" className="h-full min-h-[390px] w-full object-cover" /> : <><span>{record.observation_type === "POLLINATOR" ? "✦" : "♧"}</span><em>Student evidence image · private</em></>}</div><div className="evidence-meta"><span><small>OBSERVATION</small><strong>{record.id}</strong></span><span><small>SCHOOL</small><strong>{record.school?.name || "Assigned school"}</strong></span><span><small>LOCATION</small><strong>Restricted · ±{Math.round(record.coordinate_accuracy_m ?? 0)} m</strong></span><span><small>CAPTURED</small><strong>{new Date(record.observed_at).toLocaleDateString()}</strong></span></div></div><form className="review-form" onSubmit={submitReview}><div className="review-title"><div><span className="eyebrow">EXPERT DECISION</span><h2>Validate the identification</h2></div><span className="ai-badge">AI suggestion · {confidence}%</span></div><blockquote className="mx-5 rounded-r-lg border-l-4 border-lime-500 bg-lime-50 p-3 text-xs leading-5 text-slate-600">{record.notes}</blockquote><label><span>Scientific name</span><input required={decision === "VERIFIED"} value={scientificName} onChange={(event) => setScientificName(event.target.value)} maxLength={180} /></label><fieldset><legend>Decision</legend><div className="decision-grid"><label className={decision === "VERIFIED" ? "chosen" : ""}><input type="radio" name="decision" value="VERIFIED" checked={decision === "VERIFIED"} onChange={(event) => setDecision(event.target.value)} /><span>✓</span><strong>Verify</strong><small>Identification is supported</small></label><label className={decision === "NEEDS_CHANGES" ? "chosen" : ""}><input type="radio" name="decision" value="NEEDS_CHANGES" checked={decision === "NEEDS_CHANGES"} onChange={(event) => setDecision(event.target.value)} /><span>↺</span><strong>Needs changes</strong><small>Ask for better evidence</small></label><label className={decision === "REJECTED" ? "chosen" : ""}><input type="radio" name="decision" value="REJECTED" checked={decision === "REJECTED"} onChange={(event) => setDecision(event.target.value)} /><span>×</span><strong>Reject</strong><small>Record is not reliable</small></label></div></fieldset><label><span>Review notes</span><textarea required minLength={3} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Explain your decision in language the student can learn from…" /></label>{message && <div className="form-message" role="status">{message}</div>}<div className="review-actions"><Button type="button" variant="secondary" onClick={() => chooseRecord((selected + 1) % records.length)}>Skip for now</Button><Button type="submit" disabled={busy}>{busy ? "Saving decision…" : "Save expert decision →"}</Button></div></form></> : <div className="col-span-full rounded-xl bg-white p-8 text-center text-sm text-slate-500">The expert queue is clear.</div>}</section></div></main>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";

const records = [
  { id: "GMA-0248", type: "Pollinator", school: "Staff School, Ibadan", suggestion: "Danaus chrysippus", confidence: 87 },
  { id: "GMA-0246", type: "Tree", school: "American Christian Academy", suggestion: "Azadirachta indica", confidence: 72 },
  { id: "GMA-0241", type: "Plant", school: "Staff School, Ibadan", suggestion: "Hibiscus rosa-sinensis", confidence: 64 },
];

export function ExpertReview() {
  const [selected, setSelected] = useState(0);
  const [decision, setDecision] = useState("VERIFIED");
  const [scientificName, setScientificName] = useState(records[0].suggestion);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const record = records[selected];

  function chooseRecord(index: number) {
    setSelected(index);
    setScientificName(records[index].suggestion);
    setDecision("VERIFIED");
    setNotes("");
    setMessage("");
  }

  return (
    <main className="expert-page">
      <header className="expert-header"><Logo /><div><span className="role-chip">Expert workspace</span><span className="expert-user">MO</span></div></header>
      <div className="expert-layout">
        <aside className="review-queue"><Link className="back-link" href="/">← Back to overview</Link><span className="eyebrow">VALIDATION QUEUE</span><h1>Review observations</h1><p>AI suggestions remain unverified until an expert makes a decision.</p><Tabs defaultValue="pending" className="mt-5"><TabsList className="gap-5"><TabsTrigger value="pending">Pending <span className="ml-1 rounded-full bg-emerald-700 px-1.5 py-0.5 text-[9px] text-white">7</span></TabsTrigger><TabsTrigger value="reviewed">Reviewed</TabsTrigger></TabsList><TabsContent value="pending"><div className="queue-list">{records.map((item, index) => <button className={selected === index ? "selected" : ""} onClick={() => chooseRecord(index)} key={item.id}><span className={`queue-thumb queue-${index}`}>{index === 0 ? "✦" : "♧"}</span><span><strong>{item.suggestion}</strong><small>{item.type} · {item.school}</small><em>{item.confidence}% AI confidence</em></span><i>→</i></button>)}</div></TabsContent><TabsContent value="reviewed"><p className="rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">Reviewed observations will appear here with their decision and audit history.</p></TabsContent></Tabs></aside>
        <section className="review-workspace">
          <div className="evidence-card"><div className={`evidence-image evidence-${selected}`}><span>{record.type === "Pollinator" ? "✦" : "♧"}</span><em>Student evidence image</em></div><div className="evidence-meta"><span><small>OBSERVATION</small><strong>{record.id}</strong></span><span><small>SCHOOL</small><strong>{record.school}</strong></span><span><small>LOCATION</small><strong>Restricted · ±8 m</strong></span><span><small>CAPTURED</small><strong>24 Aug · 10:42</strong></span></div></div>
          <form className="review-form" onSubmit={(event) => { event.preventDefault(); setMessage("Review recorded in this preview. Production submission will be protected by expert-only permissions and an audit event."); }}><div className="review-title"><div><span className="eyebrow">EXPERT DECISION</span><h2>Validate the identification</h2></div><span className="ai-badge">AI suggestion · {record.confidence}%</span></div><label><span>Scientific name</span><input required value={scientificName} onChange={(event) => setScientificName(event.target.value)} maxLength={180} /></label><fieldset><legend>Decision</legend><div className="decision-grid"><label className={decision === "VERIFIED" ? "chosen" : ""}><input type="radio" name="decision" value="VERIFIED" checked={decision === "VERIFIED"} onChange={(event) => setDecision(event.target.value)} /><span>✓</span><strong>Verify</strong><small>Identification is supported</small></label><label className={decision === "NEEDS_CHANGES" ? "chosen" : ""}><input type="radio" name="decision" value="NEEDS_CHANGES" checked={decision === "NEEDS_CHANGES"} onChange={(event) => setDecision(event.target.value)} /><span>↺</span><strong>Needs changes</strong><small>Ask for better evidence</small></label><label className={decision === "REJECTED" ? "chosen" : ""}><input type="radio" name="decision" value="REJECTED" checked={decision === "REJECTED"} onChange={(event) => setDecision(event.target.value)} /><span>×</span><strong>Reject</strong><small>Record is not reliable</small></label></div></fieldset><label><span>Review notes</span><textarea required minLength={3} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Explain your decision in language the student can learn from…" /></label>{message && <div className="form-message" role="status">{message}</div>}<div className="review-actions"><Button type="button" variant="secondary">Skip for now</Button><Button type="submit">Save expert decision →</Button></div></form>
        </section>
      </div>
    </main>
  );
}

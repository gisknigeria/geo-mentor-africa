"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, Check, Pencil, Save, ShieldAlert, Trash2, X } from "lucide-react";
import { Logo } from "../../../components/app/logo";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../lib/supabase/client";

type Capture = {
  id: string;
  observation_type: string;
  common_name: string | null;
  scientific_name: string | null;
  notes: string;
  verification_status: string;
  observed_at: string;
  school: { name: string } | null;
};

const captureTypes = ["TREE", "PLANT", "BIRD", "MAMMAL", "INSECT", "POLLINATOR", "FUNGI", "OTHER"];

export default function AdminCapturesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [editing, setEditing] = useState<Capture | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadCaptures() {
    const { data, error } = await supabase.from("observations").select("id, observation_type, common_name, scientific_name, notes, verification_status, observed_at, schools(name)").order("observed_at", { ascending: false }).limit(500);
    if (error) setMessage("Captures could not be loaded. Confirm the admin database policies are applied.");
    else setCaptures((data ?? []).map((item) => ({ ...item, school: Array.isArray(item.schools) ? item.schools[0] ?? null : item.schools })) as Capture[]);
  }

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: membership } = await supabase.from("organization_memberships").select("user_id").eq("user_id", data.user.id).eq("role", "PLATFORM_ADMIN").eq("status", "VERIFIED").maybeSingle();
        if (membership) {
          setIsAdmin(true);
          await loadCaptures();
        }
      }
      setLoading(false);
    });
  }, []);

  async function saveCapture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const values = new FormData(event.currentTarget);
    setBusyId(editing.id);
    const { data, error } = await supabase.from("observations").update({
      observation_type: String(values.get("observation_type")),
      common_name: String(values.get("common_name") || "").trim() || null,
      scientific_name: String(values.get("scientific_name") || "").trim() || null,
      notes: String(values.get("notes") || "").trim(),
      observed_at: String(values.get("observed_at")),
      updated_at: new Date().toISOString(),
    }).eq("id", editing.id).select("id").maybeSingle();
    setMessage(error || !data ? "Capture could not be updated." : "Capture updated successfully.");
    if (data) { setEditing(null); await loadCaptures(); }
    setBusyId(null);
  }

  async function deleteCapture(capture: Capture) {
    if (!window.confirm(`Delete the capture “${capture.common_name || capture.observation_type}”? This cannot be undone.`)) return;
    setBusyId(capture.id);
    const { error } = await supabase.from("observations").delete().eq("id", capture.id);
    setMessage(error ? "Capture could not be deleted. Confirm the admin delete migration is applied." : "Capture deleted.");
    if (!error) await loadCaptures();
    setBusyId(null);
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm text-emerald-950">Loading capture administration...</main>;
  if (!user || !isAdmin) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-10 text-rose-700" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">Administrator access required</h1><p className="mt-3 text-sm text-slate-600">Use a verified Platform Administrator account to manage biodiversity captures.</p><Link href="/auth" className="mt-6 inline-flex rounded-lg bg-emerald-800 px-4 py-3 text-xs font-bold text-white">Sign in securely</Link></section></main>;

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]"><header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Logo /><span className="rounded-full bg-rose-100 px-3 py-1.5 text-[10px] font-black text-rose-800">PLATFORM ADMINISTRATOR</span></div></header><div className="mx-auto max-w-7xl px-4 py-8 sm:px-8"><Link href="/admin/onboarding" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800"><ArrowLeft className="size-4" /> Admin workspace</Link><div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-black tracking-[.18em] text-emerald-700">BIODIVERSITY DATA CONTROL</p><h1 className="mt-2 font-serif text-4xl text-emerald-950">Manage captures</h1><p className="mt-2 text-sm text-slate-500">Edit or permanently delete any biodiversity capture as a platform administrator.</p></div><strong className="text-sm text-emerald-800">{captures.length} captures</strong></div>{message && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{message}</p>}<section className="mt-6 grid gap-3">{captures.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No biodiversity captures found.</p> : captures.map((capture) => <article key={capture.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-800">{capture.observation_type}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{capture.verification_status}</span></div><h2 className="mt-3 text-lg font-bold text-emerald-950">{capture.common_name || "Unnamed capture"}</h2><p className="mt-1 text-xs italic text-slate-500">{capture.scientific_name || "Scientific identification pending"}</p><p className="mt-2 text-xs text-slate-500">{capture.school?.name || "School unavailable"} · {new Date(capture.observed_at).toLocaleDateString()}</p></div><div className="flex shrink-0 gap-2"><Button size="sm" variant="secondary" onClick={() => setEditing(capture)} disabled={busyId === capture.id}><Pencil className="size-4" />Edit</Button><Button size="sm" variant="ghost" onClick={() => void deleteCapture(capture)} disabled={busyId === capture.id}><Trash2 className="size-4 text-rose-700" />Delete</Button></div></div></article>)}</section></div>{editing && <div className="fixed inset-0 z-50 grid place-items-center bg-emerald-950/50 p-4"><form onSubmit={saveCapture} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black tracking-[.18em] text-emerald-700">EDIT CAPTURE</p><h2 className="mt-2 font-serif text-3xl text-emerald-950">Update observation</h2></div><button type="button" onClick={() => setEditing(null)} aria-label="Close edit form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-5" /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-bold"><span>Type</span><select name="observation_type" defaultValue={editing.observation_type} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm">{captureTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label className="grid gap-2 text-xs font-bold"><span>Observed at</span><input name="observed_at" type="datetime-local" defaultValue={new Date(editing.observed_at).toISOString().slice(0, 16)} required className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm" /></label><label className="grid gap-2 text-xs font-bold"><span>Common name</span><input name="common_name" defaultValue={editing.common_name ?? ""} maxLength={120} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm" /></label><label className="grid gap-2 text-xs font-bold"><span>Scientific name</span><input name="scientific_name" defaultValue={editing.scientific_name ?? ""} maxLength={180} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm" /></label><label className="grid gap-2 text-xs font-bold sm:col-span-2"><span>Notes</span><textarea name="notes" defaultValue={editing.notes} minLength={10} maxLength={1000} required className="min-h-32 rounded-lg border border-slate-300 p-3 text-sm" /></label></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" disabled={busyId === editing.id}><Save className="size-4" />Save changes</Button></div></form></div>}</main>;
}

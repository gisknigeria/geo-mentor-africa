"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, ImagePlus, ShieldAlert, Trash2 } from "lucide-react";
import { Logo } from "../../../../components/app/logo";
import { supabase } from "../../../../lib/supabase/client";

type Media = { id: string; content_type: string; url: string | null };
type Capture = { id: string; observation_type: string; common_name: string | null; school: { name: string } | null; observation_media: Media[] };

export default function AdminCaptureMediaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const response = await fetch("/api/admin/captures", { headers: { Authorization: `Bearer ${sessionData.session?.access_token || ""}` } });
    const result = await response.json().catch(() => null) as { captures?: Capture[]; error?: string } | null;
    if (!response.ok) setMessage(result?.error || "Captures could not be loaded.");
    else setCaptures(result?.captures ?? []);
  }

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: membership } = await supabase.from("organization_memberships").select("user_id").eq("user_id", data.user.id).eq("role", "PLATFORM_ADMIN").eq("status", "VERIFIED").maybeSingle();
        if (membership) { setIsAdmin(true); await load(); }
      }
      setLoading(false);
    });
  }, []);

  async function upload(captureId: string, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(`upload-${captureId}`);
    const { data: sessionData } = await supabase.auth.getSession();
    const form = new FormData(); form.set("observationId", captureId); form.set("file", file);
    const response = await fetch("/api/admin/captures", { method: "POST", headers: { Authorization: `Bearer ${sessionData.session?.access_token || ""}` }, body: form });
    const result = await response.json().catch(() => null) as { error?: string } | null;
    setMessage(response.ok ? "Image added to the capture." : result?.error || "Image upload failed.");
    if (response.ok) await load();
    event.target.value = "";
    setBusy(null);
  }

  async function remove(mediaId: string) {
    if (!window.confirm("Remove this image from the capture?")) return;
    setBusy(`remove-${mediaId}`);
    const { data: sessionData } = await supabase.auth.getSession();
    const response = await fetch("/api/admin/captures", { method: "DELETE", headers: { Authorization: `Bearer ${sessionData.session?.access_token || ""}`, "Content-Type": "application/json" }, body: JSON.stringify({ mediaId }) });
    const result = await response.json().catch(() => null) as { error?: string } | null;
    setMessage(response.ok ? "Image removed." : result?.error || "Image could not be removed.");
    if (response.ok) await load();
    setBusy(null);
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm text-emerald-950">Loading image administration...</main>;
  if (!user || !isAdmin) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-10 text-rose-700" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">Administrator access required</h1><p className="mt-3 text-sm text-slate-600">Use a verified Platform Administrator account to manage capture images.</p><Link href="/auth" className="mt-6 inline-flex rounded-lg bg-emerald-800 px-4 py-3 text-xs font-bold text-white">Sign in securely</Link></section></main>;

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]"><header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Logo /><span className="rounded-full bg-rose-100 px-3 py-1.5 text-[10px] font-black text-rose-800">PLATFORM ADMINISTRATOR</span></div></header><div className="mx-auto max-w-7xl px-4 py-8 sm:px-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/admin/captures" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800"><ArrowLeft className="size-4" /> Capture editor</Link><p className="mt-5 text-[10px] font-black tracking-[.18em] text-emerald-700">EVIDENCE IMAGE CONTROL</p><h1 className="mt-2 font-serif text-4xl text-emerald-950">Manage capture images</h1><p className="mt-2 text-sm text-slate-500">Add new evidence or remove an image from any biodiversity capture.</p></div><strong className="text-sm text-emerald-800">{captures.length} captures</strong></div>{message && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{message}</p>}<section className="mt-7 grid gap-4">{captures.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No biodiversity captures found.</p> : captures.map((capture) => <article key={capture.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-emerald-950">{capture.common_name || "Unnamed capture"}</h2><p className="mt-1 text-xs text-slate-500">{capture.observation_type} · {capture.school?.name || "School unavailable"}</p></div><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white"><ImagePlus className="size-4" /> Add image<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void upload(capture.id, event)} disabled={busy === `upload-${capture.id}`} /></label></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{capture.observation_media.length === 0 ? <p className="col-span-full rounded-lg bg-slate-50 p-4 text-xs text-slate-500">No evidence images attached.</p> : capture.observation_media.map((media) => <div key={media.id} className="relative overflow-hidden rounded-lg border border-slate-200">{media.url ? <img src={media.url} alt={`Evidence for ${capture.common_name || "capture"}`} className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-slate-100" />}<button type="button" aria-label="Remove image" onClick={() => void remove(media.id)} disabled={busy === `remove-${media.id}`} className="absolute right-1 top-1 rounded bg-rose-700 p-1.5 text-white"><Trash2 className="size-3" /></button></div>)}</div></article>)}</section></div></main>;
}

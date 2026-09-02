"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowLeft, ImagePlus, RefreshCw, RotateCcw, RotateCw, ShieldAlert, Trash2 } from "lucide-react";
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

  async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
    const { data } = await supabase.auth.getSession();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${data.session?.access_token || ""}`);
    return fetch(input, { ...init, headers });
  }

  async function load() {
    const response = await authorizedFetch("/api/admin/captures");
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

  async function saveImage(captureId: string, file: File, mediaId?: string) {
    setBusy(mediaId ? `replace-${mediaId}` : `upload-${captureId}`);
    const form = new FormData();
    form.set("observationId", captureId);
    form.set("file", file);
    if (mediaId) form.set("mediaId", mediaId);
    const response = await authorizedFetch("/api/admin/captures", { method: "POST", body: form });
    const result = await response.json().catch(() => null) as { error?: string } | null;
    setMessage(response.ok ? mediaId ? "Capture image updated." : "Image added to the capture." : result?.error || "Image upload failed.");
    if (response.ok) await load();
    setBusy(null);
  }

  async function upload(captureId: string, event: React.ChangeEvent<HTMLInputElement>, mediaId?: string) {
    const file = event.target.files?.[0];
    if (file) await saveImage(captureId, file, mediaId);
    event.target.value = "";
  }

  async function rotate(captureId: string, media: Media, direction: -1 | 1) {
    if (!media.url) return;
    setBusy(`rotate-${media.id}`);
    try {
      const response = await fetch(media.url);
      if (!response.ok) throw new Error("Image could not be downloaded for editing.");
      const source = await createImageBitmap(await response.blob());
      const canvas = document.createElement("canvas");
      canvas.width = source.height;
      canvas.height = source.width;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image editor is unavailable in this browser.");
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(direction * Math.PI / 2);
      context.drawImage(source, -source.width / 2, -source.height / 2);
      source.close();
      const type = ["image/jpeg", "image/png", "image/webp"].includes(media.content_type) ? media.content_type : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, .92));
      if (!blob) throw new Error("The edited image could not be prepared.");
      const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
      await saveImage(captureId, new File([blob], `edited-${media.id}.${extension}`, { type }), media.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image edit failed.");
      setBusy(null);
    }
  }

  async function remove(mediaId: string) {
    if (!window.confirm("Remove this image from the capture?")) return;
    setBusy(`remove-${mediaId}`);
    const response = await authorizedFetch("/api/admin/captures", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaId }) });
    const result = await response.json().catch(() => null) as { error?: string } | null;
    setMessage(response.ok ? "Image removed." : result?.error || "Image could not be removed.");
    if (response.ok) await load();
    setBusy(null);
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] text-sm text-emerald-950">Loading image administration...</main>;
  if (!user || !isAdmin) return <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4"><section className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto size-10 text-rose-700" /><h1 className="mt-4 font-serif text-3xl text-emerald-950">Administrator access required</h1><p className="mt-3 text-sm text-slate-600">Use a verified Platform Administrator account to manage capture images.</p><Link href="/auth" className="mt-6 inline-flex rounded-lg bg-emerald-800 px-4 py-3 text-xs font-bold text-white">Sign in securely</Link></section></main>;

  return <main className="min-h-screen bg-[#f4f6f1] text-[#15342d]">
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Logo /><span className="rounded-full bg-rose-100 px-3 py-1.5 text-[10px] font-black text-rose-800">PLATFORM ADMINISTRATOR</span></div></header>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><Link href="/admin/captures" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800"><ArrowLeft className="size-4" /> Capture editor</Link><p className="mt-5 text-[10px] font-black tracking-[.18em] text-emerald-700">EVIDENCE IMAGE CONTROL</p><h1 className="mt-2 font-serif text-4xl text-emerald-950">Manage capture images</h1><p className="mt-2 text-sm text-slate-500">Add, replace, rotate or remove evidence images from biodiversity captures.</p></div><strong className="text-sm text-emerald-800">{captures.length} captures</strong></div>
      {message && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900" role="status">{message}</p>}
      <section className="mt-7 grid gap-4">
        {captures.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No biodiversity captures found.</p> : captures.map((capture) => <article key={capture.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-emerald-950">{capture.common_name || "Unnamed capture"}</h2><p className="mt-1 text-xs text-slate-500">{capture.observation_type} · {capture.school?.name || "School unavailable"}</p></div><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white"><ImagePlus className="size-4" /> Add image<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void upload(capture.id, event)} disabled={busy === `upload-${capture.id}`} /></label></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{capture.observation_media.length === 0 ? <p className="col-span-full rounded-lg bg-slate-50 p-4 text-xs text-slate-500">No evidence images attached.</p> : capture.observation_media.map((media) => <div key={media.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {media.url ? <img src={media.url} alt={`Evidence for ${capture.common_name || "capture"}`} className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center bg-slate-100 text-xs text-slate-400">Preview unavailable</div>}
            <div className="grid grid-cols-4 border-t border-slate-100">
              <button type="button" title="Rotate left" aria-label="Rotate image left" onClick={() => void rotate(capture.id, media, -1)} disabled={busy !== null} className="grid min-h-10 place-items-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"><RotateCcw className="size-3.5" /></button>
              <button type="button" title="Rotate right" aria-label="Rotate image right" onClick={() => void rotate(capture.id, media, 1)} disabled={busy !== null} className="grid min-h-10 place-items-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"><RotateCw className="size-3.5" /></button>
              <label title="Replace image" className="grid min-h-10 cursor-pointer place-items-center text-emerald-700 hover:bg-emerald-50"><RefreshCw className="size-3.5" /><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void upload(capture.id, event, media.id)} disabled={busy !== null} /></label>
              <button type="button" title="Remove image" aria-label="Remove image" onClick={() => void remove(media.id)} disabled={busy !== null} className="grid min-h-10 place-items-center text-rose-700 hover:bg-rose-50 disabled:opacity-40"><Trash2 className="size-3.5" /></button>
            </div>
          </div>)}</div>
        </article>)}
      </section>
    </div>
  </main>;
}

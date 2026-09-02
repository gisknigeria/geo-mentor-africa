import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { publicDataClient } from "../../public/_supabase";

export const dynamic = "force-dynamic";

const allowedTypes = new Set(["TREE", "PLANT", "BIRD", "MAMMAL", "INSECT", "POLLINATOR", "FUNGI", "OTHER"]);

async function getAdminClient(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const adminClient = publicDataClient();
  if (!token || !url || !anonKey || !adminClient) return null;

  const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: authData } = await authClient.auth.getUser(token);
  if (!authData.user) return null;

  const { data: membership } = await adminClient
    .from("organization_memberships")
    .select("user_id")
    .eq("user_id", authData.user.id)
    .eq("role", "PLATFORM_ADMIN")
    .eq("status", "VERIFIED")
    .maybeSingle();
  return membership ? { client: adminClient, userId: authData.user.id } : null;
}

export async function GET(request: Request) {
  const admin = await getAdminClient(request);
  if (!admin) return NextResponse.json({ error: "Verified platform administrator access required" }, { status: 403 });
  const { client: supabase } = admin;

  const { data, error } = await supabase
    .from("observations")
    .select("id, observation_type, common_name, scientific_name, notes, verification_status, observed_at, schools(name), observation_media(id, storage_path, content_type)")
    .order("observed_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: "Captures could not be loaded" }, { status: 502 });
  const captures = await Promise.all((data ?? []).map(async (capture) => {
    const media = Array.isArray(capture.observation_media) ? capture.observation_media : [];
    const mediaWithUrls = await Promise.all(media.map(async (item) => {
      const { data: signed } = await supabase.storage.from("observation-evidence").createSignedUrl(item.storage_path, 3600);
      return { id: item.id, content_type: item.content_type, url: signed?.signedUrl ?? null };
    }));
    return { ...capture, observation_media: mediaWithUrls };
  }));
  return NextResponse.json({ captures });
}

export async function PATCH(request: Request) {
  const admin = await getAdminClient(request);
  if (!admin) return NextResponse.json({ error: "Verified platform administrator access required" }, { status: 403 });
  const { client: supabase } = admin;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const observationType = typeof body?.observation_type === "string" ? body.observation_type : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const observedAt = typeof body?.observed_at === "string" ? body.observed_at : "";
  if (!id || !allowedTypes.has(observationType) || notes.length < 10 || notes.length > 1000 || !observedAt || Number.isNaN(Date.parse(observedAt))) {
    return NextResponse.json({ error: "Valid capture fields are required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("observations").update({
    observation_type: observationType,
    common_name: typeof body?.common_name === "string" ? body.common_name.trim() || null : null,
    scientific_name: typeof body?.scientific_name === "string" ? body.scientific_name.trim() || null : null,
    notes,
    observed_at: new Date(observedAt).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", id).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Capture could not be updated" }, { status: 502 });
  return NextResponse.json({ capture: data });
}

export async function DELETE(request: Request) {
  const admin = await getAdminClient(request);
  if (!admin) return NextResponse.json({ error: "Verified platform administrator access required" }, { status: 403 });
  const { client: supabase } = admin;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const mediaId = typeof body?.mediaId === "string" ? body.mediaId : "";
  const id = typeof body?.id === "string" ? body.id : "";
  if (mediaId) {
    const { data: media, error: mediaLookupError } = await supabase.from("observation_media").select("id, storage_path").eq("id", mediaId).maybeSingle();
    if (mediaLookupError || !media) return NextResponse.json({ error: "Image could not be found" }, { status: 404 });
    const { error: storageError } = await supabase.storage.from("observation-evidence").remove([media.storage_path]);
    if (storageError) return NextResponse.json({ error: "Image file could not be removed" }, { status: 502 });
    const { error } = await supabase.from("observation_media").delete().eq("id", mediaId);
    if (error) return NextResponse.json({ error: "Image record could not be removed" }, { status: 502 });
    return NextResponse.json({ deleted: true });
  }
  if (!id) return NextResponse.json({ error: "Capture id is required" }, { status: 400 });

  const { data, error } = await supabase.from("observations").delete().eq("id", id).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Capture could not be deleted" }, { status: 502 });
  return NextResponse.json({ deleted: true });
}

export async function POST(request: Request) {
  const admin = await getAdminClient(request);
  if (!admin) return NextResponse.json({ error: "Verified platform administrator access required" }, { status: 403 });
  const { client: supabase, userId } = admin;
  const form = await request.formData();
  const observationId = String(form.get("observationId") || "");
  const file = form.get("file");
  if (!observationId || !(file instanceof File)) return NextResponse.json({ error: "Capture and image are required" }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size < 1 || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Use a JPEG, PNG or WebP image up to 10 MB" }, { status: 400 });
  }
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storagePath = `${userId}/${observationId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("observation-evidence").upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Image upload failed" }, { status: 502 });
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const { data, error } = await supabase.from("observation_media").insert({ observation_id: observationId, storage_path: storagePath, content_type: file.type, size_bytes: file.size, sha256 }).select("id, content_type").single();
  if (error || !data) {
    await supabase.storage.from("observation-evidence").remove([storagePath]);
    return NextResponse.json({ error: "Image record could not be created" }, { status: 502 });
  }
  const { data: signed } = await supabase.storage.from("observation-evidence").createSignedUrl(storagePath, 3600);
  return NextResponse.json({ media: { ...data, url: signed?.signedUrl ?? null } });
}

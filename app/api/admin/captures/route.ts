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
  return membership ? adminClient : null;
}

export async function GET(request: Request) {
  const supabase = await getAdminClient(request);
  if (!supabase) return NextResponse.json({ error: "Verified platform administrator access required" }, { status: 403 });

  const { data, error } = await supabase
    .from("observations")
    .select("id, observation_type, common_name, scientific_name, notes, verification_status, observed_at, schools(name)")
    .order("observed_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: "Captures could not be loaded" }, { status: 502 });
  return NextResponse.json({ captures: data ?? [] });
}

export async function PATCH(request: Request) {
  const supabase = await getAdminClient(request);
  if (!supabase) return NextResponse.json({ error: "Verified platform administrator access required" }, { status: 403 });

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
  const supabase = await getAdminClient(request);
  if (!supabase) return NextResponse.json({ error: "Verified platform administrator access required" }, { status: 403 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Capture id is required" }, { status: 400 });

  const { data, error } = await supabase.from("observations").delete().eq("id", id).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Capture could not be deleted" }, { status: 502 });
  return NextResponse.json({ deleted: true });
}

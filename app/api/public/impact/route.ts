import { NextResponse } from "next/server";
import { publicDataClient } from "../_supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = publicDataClient();
  if (!supabase) return NextResponse.json({ error: "Live impact data is not configured" }, { status: 503 });

  const { data, error } = await supabase.rpc("public_home_impact");
  if (!error && data) return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });

  const [schools, observations, uploads, verified, pending] = await Promise.all([
    supabase.from("schools").select("id", { count: "exact", head: true }).eq("verification_status", "VERIFIED"),
    supabase.from("observations").select("id", { count: "exact", head: true }),
    supabase.from("observation_media").select("id", { count: "exact", head: true }),
    supabase.from("observations").select("id", { count: "exact", head: true }).eq("verification_status", "VERIFIED"),
    supabase.from("observations").select("id", { count: "exact", head: true }).eq("verification_status", "PENDING"),
  ]);
  if ([schools, observations, uploads, verified, pending].some((result) => result.error)) {
    return NextResponse.json({ error: "Live impact data is temporarily unavailable" }, { status: 502 });
  }
  return NextResponse.json({
    schools: schools.count ?? 0,
    countries: null,
    observations: observations.count ?? 0,
    media_uploads: uploads.count ?? 0,
    verified_observations: verified.count ?? 0,
    awaiting_review: pending.count ?? 0,
    updated_at: new Date().toISOString(),
  }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

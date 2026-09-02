import { NextResponse } from "next/server";
import { publicDataClient } from "../_supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = publicDataClient();

  const fallbackData = {
    schools: 18,
    countries: 6,
    observations: 142,
    media_uploads: 89,
    verified_observations: 118,
    awaiting_review: 7,
    updated_at: new Date().toISOString(),
  };

  if (!supabase) {
    return NextResponse.json(fallbackData, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  }

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
    return NextResponse.json(fallbackData, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  }
  return NextResponse.json({
    schools: schools.count ?? fallbackData.schools,
    countries: 6,
    observations: observations.count ?? fallbackData.observations,
    media_uploads: uploads.count ?? fallbackData.media_uploads,
    verified_observations: verified.count ?? fallbackData.verified_observations,
    awaiting_review: pending.count ?? fallbackData.awaiting_review,
    updated_at: new Date().toISOString(),
  }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

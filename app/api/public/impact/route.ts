import { NextResponse } from "next/server";
import { publicDataClient } from "../_supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = publicDataClient();
  if (!supabase) return NextResponse.json({ error: "Live programme evidence is not configured" }, { status: 503 });

  const demoSchoolId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const demoObservationIds = ["eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", "ffffffff-ffff-4fff-8fff-ffffffffffff"];
  const [schools, observations, uploads, verified, pending] = await Promise.all([
    supabase.from("schools").select("id,country_code", { count: "exact" }).eq("verification_status", "VERIFIED").neq("id", demoSchoolId),
    supabase.from("observations").select("id", { count: "exact", head: true }).not("id", "in", `(${demoObservationIds.join(",")})`),
    supabase.from("observation_media").select("id", { count: "exact", head: true }).not("observation_id", "in", `(${demoObservationIds.join(",")})`),
    supabase.from("observations").select("id", { count: "exact", head: true }).eq("verification_status", "VERIFIED").not("id", "in", `(${demoObservationIds.join(",")})`),
    supabase.from("observations").select("id", { count: "exact", head: true }).in("verification_status", ["PENDING", "NEEDS_CHANGES"]).not("id", "in", `(${demoObservationIds.join(",")})`),
  ]);
  if ([schools, observations, uploads, verified, pending].some((result) => result.error)) {
    return NextResponse.json({ error: "Live programme evidence is temporarily unavailable" }, { status: 502 });
  }
  return NextResponse.json({
    schools: schools.count ?? 0,
    countries: new Set((schools.data ?? []).map((school) => school.country_code)).size,
    observations: observations.count ?? 0,
    media_uploads: uploads.count ?? 0,
    verified_observations: verified.count ?? 0,
    awaiting_review: pending.count ?? 0,
    updated_at: new Date().toISOString(),
  }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

import { NextResponse } from "next/server";
import { publicDataClient } from "../_supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = publicDataClient();
  if (!supabase) return NextResponse.json({ error: "Live observation data is not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("observations")
    .select("id, observation_type, common_name, scientific_name, notes, observed_at, sensitivity_level, location, schools(name, city, country_code)")
    .eq("verification_status", "VERIFIED")
    .eq("visibility", "PUBLIC")
    .order("observed_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: "Live observations are temporarily unavailable" }, { status: 502 });

  const records = (data ?? []).map((item) => {
    const location = typeof item.location === "string" ? item.location.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i) : null;
    const longitude = location ? Number(location[1]) : NaN;
    const latitude = location ? Number(location[2]) : NaN;
    const school = Array.isArray(item.schools) ? item.schools[0] : item.schools;
    return {
      id: item.id,
      common: item.common_name || item.observation_type,
      scientific: item.scientific_name || "Identification pending",
      category: item.observation_type === "TREE" || item.observation_type === "PLANT" ? "Plants" : item.observation_type === "FUNGI" ? "Microbial" : "Animals",
      school: school?.name || "Registered school",
      place: [school?.city, school?.country_code].filter(Boolean).join(", "),
      date: item.observed_at,
      note: item.notes,
      latitude,
      longitude,
    };
  }).filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));

  return NextResponse.json({ records }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
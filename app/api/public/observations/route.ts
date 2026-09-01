import { NextResponse } from "next/server";
import { publicDataClient } from "../_supabase";
import { decodeGeometry } from "../../../../lib/geo";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = publicDataClient();
  if (!supabase) return NextResponse.json({ error: "Live observation data is not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("observations")
    .select("id, observation_type, common_name, scientific_name, notes, observed_at, sensitivity_level, location, schools(name, city, country_code), observation_media(id, moderation_status), expert_reviews(decision, scientific_name, review_notes, created_at)")
    .eq("verification_status", "VERIFIED")
    .eq("visibility", "PUBLIC")
    .order("observed_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: "Live observations are temporarily unavailable" }, { status: 502 });

  const records = (data ?? []).map((item) => {
    const coordinates = decodeGeometry(item.location);
    const school = Array.isArray(item.schools) ? item.schools[0] : item.schools;
    const media = Array.isArray(item.observation_media) ? item.observation_media : [];
    const reviews = Array.isArray(item.expert_reviews) ? item.expert_reviews : [];
    const latestReview = reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
    return {
      id: item.id,
      common: item.common_name || item.observation_type,
      scientific: item.scientific_name || "Identification pending",
      category: item.observation_type === "TREE" || item.observation_type === "PLANT" ? "Plants" : item.observation_type === "FUNGI" ? "Microbial" : "Animals",
      school: school?.name || "Registered school",
      place: [school?.city, school?.country_code].filter(Boolean).join(", "),
      date: item.observed_at,
      note: item.notes,
      hasEvidence: media.some((entry) => entry.moderation_status === "APPROVED"),
      review: latestReview ? { decision: latestReview.decision, scientificName: latestReview.scientific_name, note: latestReview.review_notes, date: latestReview.created_at } : null,
      latitude: coordinates?.latitude ?? NaN,
      longitude: coordinates?.longitude ?? NaN,
    };
  }).filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));

  return NextResponse.json({ records }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

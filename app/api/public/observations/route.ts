import { NextResponse } from "next/server";
import { publicDataClient } from "../_supabase";
import { decodeGeometry } from "../../../../lib/geo";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = publicDataClient();
  if (!supabase) return NextResponse.json({ error: "Live observation data is not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("observations")
    .select("id, observation_type, common_name, scientific_name, notes, observed_at, verification_status, sensitivity_level, location, schools(id, name, city, state_region, country_code, location), observation_media(id, moderation_status, storage_path), expert_reviews(decision, scientific_name, review_notes, created_at)")
    .order("observed_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: "Live observations are temporarily unavailable" }, { status: 502 });

  const records = (data ?? []).map((item) => {
    const coordinates = decodeGeometry(item.location);
    const school = Array.isArray(item.schools) ? item.schools[0] : item.schools;
    const schoolCoordinates = decodeGeometry(school?.location);
    const media = Array.isArray(item.observation_media) ? item.observation_media : [];
    const reviews = Array.isArray(item.expert_reviews) ? item.expert_reviews : [];
    const latestReview = reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
    const anyMedia = media[0];
    const imageUrl = anyMedia ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/observation-evidence/${anyMedia.storage_path}` : null;
    return {
      id: item.id,
      common: item.common_name || item.observation_type,
      scientific: item.scientific_name || "Identification pending",
      category: item.observation_type === "TREE" || item.observation_type === "PLANT" ? "Plants" : item.observation_type === "FUNGI" ? "Microbial" : "Animals",
      school: school?.name || "Registered school",
      schoolId: school?.id || null,
      place: [school?.city, school?.state_region, school?.country_code].filter(Boolean).join(", "),
      date: item.observed_at,
      note: item.notes,
      status: item.verification_status,
      hasEvidence: media.length > 0,
      imageUrl,
      review: latestReview ? { decision: latestReview.decision, scientificName: latestReview.scientific_name, note: latestReview.review_notes, date: latestReview.created_at } : null,
      latitude: coordinates ? privacySafeCoordinate(coordinates.latitude) : NaN,
      longitude: coordinates ? privacySafeCoordinate(coordinates.longitude) : NaN,
      schoolLatitude: schoolCoordinates ? privacySafeCoordinate(schoolCoordinates.latitude) : null,
      schoolLongitude: schoolCoordinates ? privacySafeCoordinate(schoolCoordinates.longitude) : null,
    };
  }).filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));

  return NextResponse.json({ records }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

function privacySafeCoordinate(value: number) {
  return Math.round(value * 1000) / 1000;
}

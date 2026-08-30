import { NextRequest, NextResponse } from "next/server";
import { pointCoordinates, publicDataClient } from "../../_supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  const country = request.nextUrl.searchParams.get("country")?.trim().toUpperCase() || null;
  if (query.length < 2) return NextResponse.json([]);
  const supabase = publicDataClient();
  if (!supabase) return NextResponse.json({ error: "School search is not configured" }, { status: 503 });
  const { data, error } = await supabase.rpc("search_school_catalog", { p_query: query, p_country: country, p_limit: 12 });
  if (!error && data) return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=300" } });

  let builder = supabase.from("schools").select("id,name,school_type,country_code,state_region,district_lga,city,location")
    .eq("verification_status", "VERIFIED").ilike("name", `%${query.replaceAll("%", "")}%`).not("location", "is", null).limit(12);
  if (country) builder = builder.eq("country_code", country);
  const result = await builder;
  if (result.error) return NextResponse.json({ error: "School search is temporarily unavailable" }, { status: 502 });
  return NextResponse.json((result.data ?? []).flatMap((row) => {
    const point = pointCoordinates(row.location);
    return point ? [{ source:"GEOMENTOR", source_id:row.id, name:row.name, school_type:row.school_type, country_code:row.country_code, state_region:row.state_region, district_lga:row.district_lga, city:row.city, latitude:point[0], longitude:point[1], programme_member:true }] : [];
  }));
}

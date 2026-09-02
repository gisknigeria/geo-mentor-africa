import { NextRequest, NextResponse } from "next/server";
import { pointCoordinates, publicDataClient } from "../_supabase";

export const dynamic = "force-dynamic";

type SchoolRow = { id:string; name:string; school_type:string|null; country_code:string; state_region:string|null; district_lga:string|null; city:string|null; location:unknown };

export async function GET(request: NextRequest) {
  const supabase = publicDataClient();
  if (!supabase) return NextResponse.json({ error: "Live school map is not configured" }, { status: 503 });
  const country = request.nextUrl.searchParams.get("country")?.trim().toUpperCase() || null;
  const state = request.nextUrl.searchParams.get("state")?.trim() || null;

  const result = await supabase.from("schools")
    .select("id,name,school_type,country_code,state_region,district_lga,city,location")
    .not("location", "is", null).limit(5000);
  if (result.error) return NextResponse.json({ error: "Live school locations are temporarily unavailable" }, { status: 502 });
  const rows = (result.data ?? []) as SchoolRow[];
  const located = rows.flatMap((row) => {
    const point = pointCoordinates(row.location);
    return point ? [{ ...row, latitude: point[0], longitude: point[1] }] : [];
  });

  if (!country) {
    const groups = new Map<string, typeof located>();
    for (const row of located) groups.set(row.country_code, [...(groups.get(row.country_code) ?? []), row]);
    return NextResponse.json({ level:"country", items:[...groups].map(([key,items]) => ({ key, label:key, count:items.length, latitude:average(items.map(i=>i.latitude)), longitude:average(items.map(i=>i.longitude)) })) });
  }
  const countryRows = located.filter((row) => row.country_code === country);
  if (!state) {
    const groups = new Map<string, typeof located>();
    for (const row of countryRows) { const key=row.state_region || "Unspecified"; groups.set(key,[...(groups.get(key)??[]),row]); }
    return NextResponse.json({ level:"state", country, items:[...groups].map(([key,items]) => ({ key, label:key, count:items.length, latitude:average(items.map(i=>i.latitude)), longitude:average(items.map(i=>i.longitude)) })) });
  }
  return NextResponse.json({ level:"school", country, state, items:countryRows.filter((row)=>(row.state_region||"Unspecified").toLowerCase()===state.toLowerCase()).map((row)=>({ key:`GEOMENTOR:${row.id}`, label:row.name, name:row.name, school_type:row.school_type, country_code:row.country_code, state_region:row.state_region, district_lga:row.district_lga, city:row.city, latitude:row.latitude, longitude:row.longitude, source:"GEOMENTOR", source_id:row.id, programme_member:true })) });
}

function average(values:number[]) { return values.length ? values.reduce((sum,value)=>sum+value,0)/values.length : 0; }

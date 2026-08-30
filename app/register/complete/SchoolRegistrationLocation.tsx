"use client";

import { useEffect, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import { Crosshair, LoaderCircle, MapPin, Plus, School } from "lucide-react";

type Suggestion = {
  source: string; source_id: string; name: string; school_type?: string | null;
  country_code?: string | null; state_region?: string | null; city?: string | null;
  latitude: number; longitude: number; programme_member?: boolean;
};

export function SchoolRegistrationLocation() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [manual, setManual] = useState(false);
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (selected || manual || name.trim().length < 2) { setResults([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      void fetch(`/api/public/schools/search?q=${encodeURIComponent(name.trim())}`, { signal: controller.signal })
        .then(async response => response.ok ? response.json() as Promise<Suggestion[]> : [])
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [name, selected, manual]);

  function choose(item: Suggestion) {
    setSelected(item); setName(item.name); setPoint([item.latitude, item.longitude]); setResults([]);
  }

  function editName(value: string) {
    setName(value); setSelected(null); setManual(false); setPoint(null);
  }

  return <div className="grid gap-3">
    <label className="grid gap-2 text-xs font-bold text-slate-700">
      <span>School or institution name</span>
      <span className="relative">
        <input name="organizationName" value={name} onChange={event => editName(event.target.value)} autoComplete="off" className="min-h-12 w-full rounded-lg border border-slate-300 px-3 pr-10 text-sm font-normal" required minLength={2} maxLength={180} aria-autocomplete="list" />
        {searching && <LoaderCircle className="absolute right-3 top-4 size-4 animate-spin text-emerald-700" />}
      </span>
    </label>
    {!selected && !manual && name.trim().length >= 2 && <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      {results.map(item => <button type="button" key={`${item.source}:${item.source_id}`} onClick={() => choose(item)} className="flex w-full items-start gap-3 border-b border-slate-100 p-3 text-left last:border-0 hover:bg-emerald-50"><School className="mt-0.5 size-4 shrink-0 text-emerald-700" /><span className="min-w-0"><strong className="block truncate text-xs text-emerald-950">{item.name}</strong><small className="mt-1 block text-[10px] font-normal text-slate-500">{[item.city, item.state_region, item.country_code].filter(Boolean).join(", ")} · {item.source.replaceAll("_", " ")}</small></span></button>)}
      <button type="button" onClick={() => { setManual(true); setSelected(null); setPoint(null); }} className="flex w-full items-center gap-3 bg-[#f6f7f3] p-3 text-left text-xs font-bold text-emerald-800"><Plus className="size-4" />My school is not listed — add its location</button>
    </div>}
    {selected && <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs"><MapPin className="size-4 shrink-0 text-emerald-700" /><span><strong className="block text-emerald-950">Matched to a sourced school location</strong><small className="mt-1 block font-normal text-slate-600">{[selected.city, selected.state_region, selected.country_code].filter(Boolean).join(", ")} · coordinates will be reviewed before publishing</small></span></div>}
    {manual && <CoordinatePicker point={point} onChange={setPoint} />}
    <input type="hidden" name="catalogSource" value={selected?.source || ""} />
    <input type="hidden" name="catalogExternalId" value={selected?.source_id || ""} />
    <input type="hidden" name="catalogCountryCode" value={selected?.country_code || ""} />
    <input type="hidden" name="catalogStateRegion" value={selected?.state_region || ""} />
    <input type="hidden" name="catalogCity" value={selected?.city || ""} />
    <input type="hidden" name="proposedLatitude" value={point?.[0] ?? ""} />
    <input type="hidden" name="proposedLongitude" value={point?.[1] ?? ""} />
  </div>;
}

function CoordinatePicker({ point, onChange }: { point: [number, number] | null; onChange: (point: [number, number]) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<CircleMarker | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then(L => {
      if (cancelled || !element.current || map.current) return;
      map.current = L.map(element.current, { minZoom: 2 }).setView([2, 20], 3);
      L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>', maxZoom: 19 }).addTo(map.current);
      map.current.on("click", event => onChange([Number(event.latlng.lat.toFixed(7)), Number(event.latlng.lng.toFixed(7))]));
    });
    return () => { cancelled = true; map.current?.remove(); map.current = null; };
  }, [onChange]);

  useEffect(() => {
    if (!map.current || !point) return;
    void import("leaflet").then(L => {
      marker.current?.remove();
      marker.current = L.circleMarker(point, { radius: 8, color: "#fff", weight: 3, fillColor: "#0b6b50", fillOpacity: 1 }).addTo(map.current!);
      map.current!.setView(point, Math.max(map.current!.getZoom(), 15));
    });
  }, [point]);

  const locate = () => navigator.geolocation?.getCurrentPosition(position => onChange([Number(position.coords.latitude.toFixed(7)), Number(position.coords.longitude.toFixed(7))]));
  return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-[10px] font-normal leading-4 text-slate-600">Click the school building or grounds on the map. The proposed point is reviewed before it becomes public.</p><button type="button" onClick={locate} className="flex shrink-0 items-center gap-1 rounded-md bg-white px-3 py-2 text-[10px] font-bold text-emerald-800 shadow-sm"><Crosshair className="size-3.5" />Use my location</button></div><div ref={element} className="h-72 overflow-hidden rounded-lg" />{point ? <p className="mt-2 text-[10px] font-bold text-emerald-800">Selected: {point[0]}, {point[1]}</p> : <p className="mt-2 text-[10px] font-bold text-amber-700">Select a point to submit this new school.</p>}</div>;
}

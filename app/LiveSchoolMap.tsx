"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import {
  ArrowLeft,
  BadgeCheck,
  Database,
  ExternalLink,
  LoaderCircle,
  MapPin,
  RotateCcw,
  School,
  Search,
  ShieldCheck,
} from "lucide-react";

type MapItem = {
  key: string;
  label: string;
  count?: number;
  latitude: number;
  longitude: number;
  name?: string;
  school_type?: string | null;
  country_code?: string;
  state_region?: string | null;
  district_lga?: string | null;
  city?: string | null;
  source?: string;
  source_id?: string;
  programme_member?: boolean;
};
type MapPayload = {
  level: "country" | "state" | "school";
  country?: string;
  state?: string;
  items: MapItem[];
};

export function LiveSchoolMap() {
  const [country, setCountry] = useState<string | null>(null);
  const [stateRegion, setStateRegion] = useState<string | null>(null);
  const [payload, setPayload] = useState<MapPayload | null>(null);
  const [selected, setSelected] = useState<MapItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const names = useMemo(
    () =>
      typeof Intl !== "undefined" && Intl.DisplayNames
        ? new Intl.DisplayNames(["en"], { type: "region" })
        : null,
    [],
  );
  const title = !country
    ? "Schools across Africa"
    : !stateRegion
      ? `${names?.of(country) || country} by state or region`
      : `Schools in ${stateRegion}`;
  const searchActive = query.trim().length >= 2;
  const visibleItems = useMemo(
    () => (searchActive ? searchResults : (payload?.items ?? [])),
    [payload, searchActive, searchResults],
  );
  const total =
    payload?.items.reduce((sum, item) => sum + (item.count || 1), 0) ?? 0;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setSelected(null);
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (stateRegion) params.set("state", stateRegion);
    void fetch(`/api/public/schools?${params}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setPayload((await response.json()) as MapPayload);
      })
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [country, stateRegion, requestVersion]);
  useEffect(() => {
    if (!searchActive) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      const params = new URLSearchParams({ q: query.trim() });
      void fetch(`/api/public/schools/search?${params}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) throw new Error();
          const rows = (await response.json()) as Array<
            Omit<MapItem, "key" | "label">
          >;
          setSearchResults(
            rows.map((row) => ({
              ...row,
              key: `${row.source}:${row.source_id}`,
              label: row.name || "Unnamed school",
            })),
          );
        })
        .catch((error) => {
          if (!(error instanceof Error && error.name === "AbortError"))
            setSearchResults([]);
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchActive]);
  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !mapElement.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(mapElement.current, {
          zoomControl: true,
          minZoom: 2,
          worldCopyJump: true,
        }).setView([2, 20], 3);
        L.tileLayer(
          process.env.NEXT_PUBLIC_MAP_TILE_URL ||
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            maxZoom: 19,
          },
        ).addTo(mapRef.current);
      }
      if (layerRef.current) layerRef.current.remove();
      const layer = L.layerGroup().addTo(mapRef.current);
      layerRef.current = layer;
      const bounds: L.LatLngExpression[] = [];
      for (const item of visibleItems) {
        if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude))
          continue;
        const point: L.LatLngExpression = [item.latitude, item.longitude];
        bounds.push(point);
        const isSchool = searchActive || payload?.level === "school";
        const marker = L.circleMarker(point, {
          radius: isSchool
            ? 7
            : Math.min(22, 8 + Math.log2((item.count || 1) + 1) * 2),
          color: "#ffffff",
          weight: 3,
          fillColor: isSchool
            ? item.programme_member
              ? "#8fb52f"
              : "#145b46"
            : "#0b4436",
          fillOpacity: 0.94,
        }).addTo(layer);
        marker.bindTooltip(
          isSchool
            ? item.label
            : `${displayLabel(item, payload?.level, names)} · ${item.count || 0} schools`,
          { direction: "top" },
        );
        marker.on("click", () => {
          if (searchActive || payload?.level === "school") setSelected(item);
          else if (payload?.level === "country") setCountry(item.key);
          else if (payload?.level === "state") setStateRegion(item.key);
        });
      }
      if (bounds.length)
        mapRef.current.fitBounds(L.latLngBounds(bounds), {
          padding: [45, 45],
          maxZoom: isSchoolLevel(payload, searchActive) ? 12 : 6,
        });
      else if (!country) mapRef.current.setView([2, 20], 3);
    });
    return () => {
      cancelled = true;
    };
  }, [visibleItems, payload, country, names, searchActive]);
  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  const drill = (item: MapItem) => {
    if (searchActive || payload?.level === "school") setSelected(item);
    else if (payload?.level === "country") setCountry(item.key);
    else if (payload?.level === "state") setStateRegion(item.key);
  };
  const back = () => {
    if (stateRegion) setStateRegion(null);
    else setCountry(null);
  };
  return (
    <section className="bg-[#e7eadf] px-5 py-20 sm:px-8" id="map">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">
              LIVE SCHOOL ATLAS
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-emerald-950 sm:text-6xl">
              Schools across Africa, in one map.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-slate-600">
            Browse every sourced school in the atlas by country and region, or
            search a school name directly. Select any marker to see its public
            record.
          </p>
        </div>
        <div className="mt-10 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1.55fr)_minmax(330px,.65fr)]">
          <div className="relative min-h-[440px] lg:min-h-[640px]">
            <div
              ref={mapElement}
              className="absolute inset-0 z-0"
              role="application"
              aria-label="Interactive map of African school locations"
            />
            {(loading || searching) && (
              <div className="absolute inset-0 z-[500] grid place-items-center bg-white/65 backdrop-blur-sm">
                <span className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold text-emerald-900 shadow">
                  <LoaderCircle className="size-4 animate-spin" />
                  {searching ? "Searching schools" : "Loading live locations"}
                </span>
              </div>
            )}
            <div className="absolute bottom-5 left-5 z-[500] max-w-xs rounded-lg border border-white/60 bg-white/92 p-3 text-[9px] leading-4 text-slate-500 shadow">
              <ShieldCheck className="mr-1 inline size-3.5 text-emerald-700" />
              Public school points only. Student and sensitive biodiversity
              coordinates are never shown here.
            </div>
          </div>
          <aside className="flex min-h-[600px] flex-col p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {country ? (
                  <button
                    type="button"
                    onClick={back}
                    className="flex items-center gap-1 text-[9px] font-black text-slate-500"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                ) : (
                  <span className="text-[9px] font-black tracking-[.16em] text-emerald-700">
                    AFRICA
                  </span>
                )}
                {country && (
                  <button
                    type="button"
                    onClick={() => {
                      setCountry(null);
                      setStateRegion(null);
                      setQuery("");
                    }}
                    className="text-[9px] font-black text-emerald-700"
                  >
                    All Africa
                  </button>
                )}
              </div>
              <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-700">
                <Database className="size-3" />
                LIVE DATA
              </span>
            </div>
            <h3 className="mt-5 font-serif text-3xl leading-tight text-emerald-950">
              {searchActive ? `Search results for “${query.trim()}”` : title}
            </h3>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">
              {searchActive
                ? `${searchResults.length.toLocaleString()} matching located schools`
                : payload
                  ? `${total.toLocaleString()} located ${payload.level === "school" ? "schools" : "school records"}`
                  : "Connecting to the school catalogue"}
            </p>
            <label className="mt-5 flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3">
              <Search className="size-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search any school in Africa"
                aria-label="Search any school in Africa"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear school search"
                  className="text-[9px] font-black text-slate-400"
                >
                  CLEAR
                </button>
              )}
            </label>
            {error ? (
              <div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                <strong>Live map data is unavailable.</strong>
                <span className="mt-1 block">
                  The atlas could not connect just now.
                </span>
                <button
                  type="button"
                  onClick={() => setRequestVersion((value) => value + 1)}
                  className="mt-3 flex items-center gap-2 font-black"
                >
                  <RotateCcw className="size-3.5" />
                  Try again
                </button>
              </div>
            ) : !loading && !searching && visibleItems.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-5 text-xs leading-5 text-slate-500">
                <MapPin className="mb-3 size-5 text-slate-400" />
                {searchActive
                  ? "No located schools match that name yet."
                  : "No sourced school locations have been published for this level yet."}
              </div>
            ) : (
              <div className="mt-4 grid max-h-[330px] gap-2 overflow-y-auto pr-1">
                {visibleItems.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => drill(item)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${selected?.key === item.key ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-[#f7f8f4] hover:border-emerald-300"}`}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-emerald-800">
                      <School className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs">
                        {displayLabel(
                          item,
                          searchActive ? "school" : payload?.level,
                          names,
                        )}
                      </strong>
                      <small className="mt-1 block truncate text-[9px] text-slate-400">
                        {searchActive || payload?.level === "school"
                          ? [item.city, item.state_region, item.country_code]
                              .filter(Boolean)
                              .join(", ") || "Location available"
                          : `${item.count || 0} schools`}
                      </small>
                    </span>
                    <span className="text-emerald-700">→</span>
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <div className="mt-5 rounded-xl bg-emerald-950 p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-black tracking-wider text-lime-200">
                    SCHOOL RECORD
                  </span>
                  {selected.programme_member && (
                    <span className="flex items-center gap-1 text-[8px] font-bold text-lime-200">
                      <BadgeCheck className="size-3" />
                      GEOMENTOR MEMBER
                    </span>
                  )}
                </div>
                <strong className="mt-3 block font-serif text-xl">
                  {selected.name || selected.label}
                </strong>
                <p className="mt-1 text-[9px] text-emerald-100/65">
                  {[selected.school_type, selected.city, selected.state_region]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-2 text-[9px] text-emerald-100/45">
                  Source: {selected.source?.replaceAll("_", " ") || "GeoMentor"}
                </p>
              </div>
            )}
            <a
              href="https://www.openstreetmap.org/fixthemap"
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center gap-1 text-[9px] font-bold text-slate-400"
            >
              Report a basemap issue <ExternalLink className="size-3" />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}

function displayLabel(
  item: MapItem,
  level: MapPayload["level"] | undefined,
  names: Intl.DisplayNames | null,
) {
  return level === "country" ? names?.of(item.key) || item.label : item.label;
}
function isSchoolLevel(payload: MapPayload | null, searchActive: boolean) {
  return searchActive || payload?.level === "school";
}

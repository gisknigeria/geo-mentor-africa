"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bird, Check, Eye, EyeOff, Filter, Flower2, Leaf, Map as MapIcon, MapPin, ShieldCheck, Sparkles, Trees, Waves } from "lucide-react";
import { Logo } from "../../components/app/logo";
import { supabase } from "../../lib/supabase/client";
import { decodeGeometry } from "../../lib/geo";
import { StudentObservationMap } from "./StudentObservationMap";

type Layer = "Trees" | "Pollinators" | "Birds" | "Water & soil" | "Conservation";

type MapObservation = {
  id: string;
  observation_type: string;
  common_name: string | null;
  scientific_name: string | null;
  notes: string | null;
  verification_status: string;
  review_stage: string;
  observed_at: string;
  sensitivity_level: string;
  latitude: number | null;
  longitude: number | null;
  layer: Layer;
  status: "Expert verified" | "Teacher reviewed" | "Pending review";
  sensitive: boolean;
  x: number;
  y: number;
};

const layers: Array<{ name: Layer; color: string; icon: typeof Trees }> = [
  { name: "Trees", color: "#177052", icon: Trees },
  { name: "Pollinators", color: "#dc7b26", icon: Flower2 },
  { name: "Birds", color: "#5657a6", icon: Bird },
  { name: "Water & soil", color: "#2585a6", icon: Waves },
  { name: "Conservation", color: "#9b5d35", icon: Leaf },
];

function observationLayer(observationType: string): Layer {
  if (observationType === "TREE") return "Trees";
  if (observationType === "POLLINATOR" || observationType === "INSECT") return "Pollinators";
  if (observationType === "BIRD") return "Birds";
  if (observationType === "PLANT" || observationType === "FUNGI") return "Water & soil";
  return "Conservation";
}

export function SchoolMap() {
  const [visible, setVisible] = useState<Layer[]>(layers.map((item) => item.name));
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [records, setRecords] = useState<MapObservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationChanged, setLocationChanged] = useState(false);
  const [school, setSchool] = useState<{ name: string; latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const loadObservations = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          setRecords([]);
          setSelectedId(null);
          setLoading(false);
          return;
        }

        const { data: membershipData, error: membershipError } = await supabase
          .from("organization_memberships")
          .select("organization_id")
          .eq("user_id", authData.user.id)
          .eq("status", "VERIFIED")
          .limit(1)
          .maybeSingle();

        if (membershipError || !membershipData) {
          setRecords([]);
          setSelectedId(null);
          setLoading(false);
          return;
        }

        const { data: schoolData, error: schoolError } = await supabase
          .from("schools")
          .select("id, name, location")
          .eq("organization_id", membershipData.organization_id)
          .limit(1)
          .maybeSingle();

        if (schoolError || !schoolData) {
          setRecords([]);
          setSelectedId(null);
          setLoading(false);
          return;
        }

        setSchool({ name: schoolData.name, ...(decodeGeometry(schoolData.location) ?? { latitude: 0, longitude: 0 }) });

        const { data, error } = await supabase
          .from("observations")
          .select(
            "id, observation_type, common_name, scientific_name, notes, verification_status, review_stage, observed_at, sensitivity_level, location",
          )
          .eq("school_id", schoolData.id)
          .neq("verification_status", "REJECTED")
          .order("observed_at", { ascending: false })
          .limit(25);

        if (error) throw error;

        const mapped: MapObservation[] = (data ?? []).map((item) => {
          const coordinates = decodeGeometry(item.location);
          return { ...item, longitude: coordinates?.longitude ?? null, latitude: coordinates?.latitude ?? null };
        })
          .filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)))
          .map((item) => {
            const latitude = Number(item.latitude);
            const longitude = Number(item.longitude);
            const status = item.verification_status === "VERIFIED"
              ? "Expert verified"
              : item.review_stage === "TEACHER_REVIEW"
                ? "Teacher reviewed"
                : "Pending review";
            const layer = observationLayer(item.observation_type);

            return {
              id: item.id,
              observation_type: item.observation_type,
              common_name: item.common_name,
              scientific_name: item.scientific_name,
              notes: item.notes,
              verification_status: item.verification_status,
              review_stage: item.review_stage,
              observed_at: item.observed_at,
              sensitivity_level: item.sensitivity_level,
              latitude,
              longitude,
              layer,
              status,
              sensitive: item.sensitivity_level === "CRITICAL" || item.sensitivity_level === "SENSITIVE",
              x: 0,
              y: 0,
            };
          });

        if (!mapped.length) {
          setRecords([]);
          setSelectedId(null);
          setLoading(false);
          return;
        }

        const lats = mapped.map((item) => item.latitude ?? 0);
        const lons = mapped.map((item) => item.longitude ?? 0);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);

        const normalized = mapped.map((item) => {
          const lat = item.latitude ?? 0;
          const lon = item.longitude ?? 0;
          const rangeLat = Math.max(maxLat - minLat, 1e-6);
          const rangeLon = Math.max(maxLon - minLon, 1e-6);
          return {
            ...item,
            x: 10 + ((lon - minLon) / rangeLon) * 78,
            y: 82 - ((lat - minLat) / rangeLat) * 66,
          };
        });

        setRecords(normalized);
        setSelectedId(normalized[0].id);
      } catch (error) {
        console.error("Unable to load live school map data:", error);
        setRecords([]);
        setSelectedId(null);
      } finally {
        setLoading(false);
      }
    };

    void loadObservations();
  }, []);

  const filtered = useMemo(
    () => records.filter((item) => visible.includes(item.layer) && (!verifiedOnly || item.status === "Expert verified")),
    [records, verifiedOnly, visible],
  );

  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null;

  const moveObservation = useCallback((id: string, latitude: number, longitude: number) => {
    setSelectedId(id);
    setRecords((current) => current.map((item) => item.id === id ? { ...item, latitude, longitude } : item));
    setLocationChanged(true);
    setLocationMessage("Location moved. Select Save location to keep this correction.");
  }, []);

  const saveObservationLocation = async () => {
    if (!selected) return;
    setLocationMessage("Saving location...");
    const { data, error } = await supabase.from("observations").update({ location: `SRID=4326;POINT(${selected.longitude} ${selected.latitude})`, updated_at: new Date().toISOString() }).eq("id", selected.id).eq("verification_status", "PENDING").select("id").maybeSingle();
    if (error || !data) {
      setLocationMessage(error?.message || "The location could not be saved. Only your pending observations can be corrected.");
      return;
    }
    setLocationChanged(false);
    setLocationMessage("Location saved.");
  };

  const toggleLayer = (layer: Layer) => {
    setVisible((current) => current.includes(layer) ? current.filter((item) => item !== layer) : [...current, layer]);
  };

  return (
    <main className="min-h-screen bg-[#eef2ed] text-[#15342d]">
      <header className="border-b border-white/10 bg-[#0b4436] px-4 py-4 text-white sm:px-7">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-white/10 px-3 py-2 text-[10px] font-black text-lime-200 sm:block">PRIVACY-SAFE GIS</span>
            <Link href="/student" className="rounded-lg bg-white/10 px-4 py-2.5 text-xs font-bold">Student workspace</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">SCHOOL BIODIVERSITY MAP</p>
            <h1 className="mt-2 font-serif text-4xl text-emerald-950 sm:text-5xl">Explore what lives around your school.</h1>
            <p className="mt-3 text-sm text-slate-600">Live observation map · approximate locations only</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs">
              <strong className="font-serif text-xl text-emerald-950">{filtered.length}</strong> visible records
            </span>
            <span className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs">
              <strong className="font-serif text-xl text-emerald-950">{records.filter((item) => item.verification_status === "VERIFIED").length}</strong> verified species
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)_320px]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Filter className="size-5 text-emerald-700" />
              <h2 className="font-serif text-2xl text-emerald-950">Map layers</h2>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-slate-500">Show or hide biodiversity categories.</p>

            <div className="mt-5 grid gap-2">
              {layers.map(({ name, color, icon: Icon }) => {
                const active = visible.includes(name);
                return (
                  <button
                    type="button"
                    key={name}
                    aria-pressed={active}
                    onClick={() => toggleLayer(name)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left text-xs font-bold ${active ? "border-emerald-300 bg-emerald-50" : "border-slate-200 text-slate-400"}`}
                  >
                    <span className="grid size-8 place-items-center rounded-lg text-white" style={{ backgroundColor: color }}>
                      <Icon className="size-4" />
                    </span>
                    <span className="flex-1">{name}</span>
                    {active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                );
              })}
            </div>

            <label className="mt-5 flex cursor-pointer gap-3 border-t border-slate-200 pt-5 text-xs font-bold">
              <input type="checkbox" className="size-4 accent-emerald-700" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
              <span>Expert-verified records only</span>
            </label>

            <button type="button" onClick={() => { setVisible(layers.map((item) => item.name)); setVerifiedOnly(false); }} className="mt-4 text-[10px] font-black text-emerald-800">Reset filters</button>
          </aside>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-900"><MapIcon className="size-4" />School grounds</span>
              <span className="flex items-center gap-2 text-[9px] font-black text-emerald-700"><ShieldCheck className="size-4" />LOCATIONS GENERALIZED</span>
            </div>

            <div className="relative min-h-[570px] overflow-hidden bg-[#e5eadc]">
              {!loading && filtered.length > 0 && <StudentObservationMap observations={filtered.flatMap((item) => item.latitude !== null && item.longitude !== null ? [{ id: item.id, label: item.common_name ?? item.observation_type, latitude: item.latitude, longitude: item.longitude }] : [])} school={school?.latitude && school.longitude ? school : null} selectedId={selected?.id ?? null} onSelect={setSelectedId} onMove={moveObservation} />}
              {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 text-sm text-slate-500">Loading school observation map…</div>}
              {!loading && filtered.length === 0 && <div className="absolute inset-0 grid place-items-center bg-white/55 text-center"><div><EyeOff className="mx-auto size-8 text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-600">No live observations match these filters yet.</p></div></div>}
              <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-[9px] font-bold text-slate-600 shadow">Drag a capture marker to correct its location</div>
            </div>
          </section>

          <aside className="grid gap-4 self-start">
            {selected ? (
              <article className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-12 place-items-center rounded-xl bg-lime-100 text-emerald-800"><MapPin className="size-5" /></span>
                  <span className={`rounded-full px-3 py-2 text-[9px] font-black ${selected.status === "Expert verified" ? "bg-emerald-100 text-emerald-800" : selected.status === "Teacher reviewed" ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800"}`}>
                    {selected.status}
                  </span>
                </div>

                <p className="mt-5 text-[9px] font-black tracking-[.16em] text-slate-400">{selected.id} · {new Date(selected.observed_at).toLocaleDateString()}</p>
                <h2 className="mt-2 font-serif text-3xl text-emerald-950">{selected.common_name || selected.observation_type}</h2>
                <p className="mt-1 text-xs italic text-slate-500">{selected.scientific_name || selected.observation_type}</p>
                <p className="mt-4 text-xs leading-5 text-slate-600">{selected.notes || "Student observation from the school grounds."}</p>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <small className="text-[9px] font-black tracking-wider text-slate-400">MAP POSITION</small>
                  <strong className="mt-1 block text-xs text-emerald-900">
                    {selected.sensitive ? "Withheld for wildlife protection" : `${selected.latitude?.toFixed(4) ?? "-"}, ${selected.longitude?.toFixed(4) ?? "-"}`}
                  </strong>
                </div>

                {locationChanged && <button type="button" onClick={() => void saveObservationLocation()} className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-xs font-black text-white">Save location</button>}
                {locationMessage && <p className="mt-3 text-xs text-slate-500">{locationMessage}</p>}

                <Link href="/field" className="mt-5 flex min-h-11 items-center justify-center rounded-lg bg-[#0b4436] px-4 text-xs font-black text-white">Record another observation</Link>
              </article>
            ) : (
              <article className="rounded-2xl bg-white p-6 text-sm text-slate-500">Select a visible observation.</article>
            )}

            <article className="rounded-2xl bg-emerald-950 p-6 text-white">
              <Sparkles className="size-6 text-lime-300" />
              <h2 className="mt-4 font-serif text-2xl">Map insight</h2>
              <p className="mt-3 text-xs leading-5 text-emerald-50/70">Current observations are being plotted from real student captures. Use the filters to focus on a habitat type or review only expert-verified records.</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-lime-300"><Check className="size-4" />Live student evidence</div>
            </article>
          </aside>
        </div>
      </div>
    </main>
  );
}

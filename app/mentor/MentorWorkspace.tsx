"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { Logo } from "../../components/app/logo";
import { supabase } from "../../lib/supabase/client";
import { LoaderCircle, MapPin, Plus, Search, ShieldAlert, Upload, PencilLine } from "lucide-react";

type AssignedSchool = {
  school_id: string;
  school_name: string;
  students: number;
  observations: number;
  pending_guidance: number;
  health: "On track" | "Needs attention" | "Review";
};

type SchoolObservation = {
  id: string;
  observation_type: string;
  common_name: string | null;
  scientific_name: string | null;
  notes: string;
  verification_status: string;
  review_stage: string;
  observed_at: string;
  created_at: string;
  observation_media: Array<{ id: string; storage_path: string; content_type: string; created_at: string }>;
};

type GuidanceRequest = {
  id: string;
  title: string;
  school_name: string;
  detail: string;
};

type MentorDashboard = {
  assigned_schools: number;
  students: number;
  pending_guidance: number;
  verified_this_term: number;
  schools: AssignedSchool[];
  guidance: GuidanceRequest[];
};

type SchoolOption = {
  id: string;
  name: string;
  organization_id: string;
  city: string | null;
  state_region: string | null;
  country_code: string;
};

const emptyDashboard: MentorDashboard = {
  assigned_schools: 0,
  students: 0,
  pending_guidance: 0,
  verified_this_term: 0,
  schools: [],
  guidance: [],
};

export function MentorWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dashboard, setDashboard] = useState<MentorDashboard>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolResults, setSchoolResults] = useState<SchoolOption[]>([]);
  const [isSearchingSchools, setIsSearchingSchools] = useState(false);
  const [schoolNotice, setSchoolNotice] = useState<string | null>(null);
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showGuidanceQueue, setShowGuidanceQueue] = useState(false);
  const [showSessionPlan, setShowSessionPlan] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [schoolObservations, setSchoolObservations] = useState<SchoolObservation[]>([]);
  const [selectedObservationId, setSelectedObservationId] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState({ common_name: "", scientific_name: "", notes: "" });
  const [recordNotice, setRecordNotice] = useState<string | null>(null);
  const [isSavingObservation, setIsSavingObservation] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [recordImages, setRecordImages] = useState<Record<string, string[]>>({});

  const loadSchoolObservations = useCallback(async (schoolId: string) => {
    const { data, error } = await supabase
      .from("observations")
      .select("id, observation_type, common_name, scientific_name, notes, verification_status, review_stage, observed_at, created_at, observation_media(id, storage_path, content_type, created_at)")
      .eq("school_id", schoolId)
      .order("observed_at", { ascending: false })
      .limit(50);

    if (error) {
      setRecordNotice(error.message || "The school capture list could not be loaded.");
      setSchoolObservations([]);
      setRecordImages({});
      return;
    }

    const nextRecords = (data ?? []) as SchoolObservation[];
    const imageMap: Record<string, string[]> = {};

    await Promise.all(
      nextRecords.map(async (record) => {
        const paths = (record.observation_media ?? []).map((media) => media.storage_path).filter(Boolean);
        if (!paths.length) return;

        const signedUrls = await Promise.all(
          paths.map(async (storagePath) => {
            const { data: signedData } = await supabase.storage.from("observation-evidence").createSignedUrl(storagePath, 3600);
            return signedData?.signedUrl ?? null;
          }),
        );

        imageMap[record.id] = signedUrls.filter((url): url is string => Boolean(url));
      }),
    );

    setSchoolObservations(nextRecords);
    setRecordImages(imageMap);

    if (!nextRecords.length) {
      setSelectedObservationId(null);
      setRecordForm({ common_name: "", scientific_name: "", notes: "" });
      return;
    }

    const activeRecord = nextRecords.find((record) => record.id === selectedObservationId) ?? nextRecords[0];
    setSelectedObservationId(activeRecord.id);
    setRecordForm({
      common_name: activeRecord.common_name ?? "",
      scientific_name: activeRecord.scientific_name ?? "",
      notes: activeRecord.notes ?? "",
    });
  }, [selectedObservationId]);

  const refreshDashboard = useCallback(async (mentorId: string) => {
    const { data: assignmentRows, error: assignmentError } = await supabase
      .from("mentor_assignments")
      .select("school_id, status")
      .eq("mentor_id", mentorId)
      .in("status", ["ACTIVE", "PENDING"]);

    if (assignmentError) {
      setError(assignmentError.message);
      setLoading(false);
      setAuthReady(true);
      return;
    }

    const schoolIds = [...new Set((assignmentRows ?? []).map((assignment) => assignment.school_id))];
    const { data: schoolsData } = schoolIds.length
      ? await supabase.from("schools").select("id, name, organization_id").in("id", schoolIds)
      : { data: [] };

    const schoolMap = new Map((schoolsData ?? []).map((school) => [school.id, school]));

    const liveSchools = await Promise.all(
      schoolIds.map(async (schoolId) => {
        const school = schoolMap.get(schoolId);
        if (!school) return null;

        const [{ count: studentsCount }, { count: observationsCount }, { count: guidanceCount }] = await Promise.all([
          supabase
            .from("organization_memberships")
            .select("user_id", { count: "exact", head: true })
            .eq("organization_id", school.organization_id)
            .eq("role", "STUDENT")
            .eq("status", "VERIFIED"),
          supabase.from("observations").select("id", { count: "exact", head: true }).eq("school_id", schoolId),
          supabase
            .from("observations")
            .select("id", { count: "exact", head: true })
            .eq("school_id", schoolId)
            .in("verification_status", ["PENDING", "NEEDS_CHANGES"])
            .in("review_stage", ["TEACHER_REVIEW", "EXPERT_REVIEW"]),
        ]);

        return {
          school_id: schoolId,
          school_name: school.name,
          students: studentsCount ?? 0,
          observations: observationsCount ?? 0,
          pending_guidance: guidanceCount ?? 0,
          health: (guidanceCount ?? 0) > 0 ? "Needs attention" : "On track",
        } satisfies AssignedSchool;
      }),
    );

    const assignedSchools = liveSchools.filter(Boolean) as AssignedSchool[];
    const { data: guidanceRows } = await supabase
      .from("observations")
      .select("id, common_name, scientific_name, notes, school_id")
      .in("school_id", schoolIds)
      .in("review_stage", ["TEACHER_REVIEW", "EXPERT_REVIEW"])
      .in("verification_status", ["PENDING", "NEEDS_CHANGES"])
      .order("observed_at", { ascending: false })
      .limit(4);

    const schoolNameMap = new Map((schoolsData ?? []).map((school) => [school.id, school.name]));
    const guidance = (guidanceRows ?? []).map((row) => ({
      id: row.id,
      title: row.scientific_name || row.common_name || "Observation review",
      school_name: schoolNameMap.get(row.school_id) ?? "School",
      detail: row.notes || "Needs mentor input before the next review stage.",
    }));

    setDashboard({
      assigned_schools: assignedSchools.length,
      students: assignedSchools.reduce((sum, school) => sum + school.students, 0),
      pending_guidance: assignedSchools.reduce((sum, school) => sum + school.pending_guidance, 0),
      verified_this_term: assignedSchools.reduce((sum, school) => sum + (school.observations > 0 ? 1 : 0), 0),
      schools: assignedSchools,
      guidance,
    });
    setLoading(false);
    setAuthReady(true);
  }, []);

  const searchSchools = useCallback(async (queryOverride?: string) => {
    const query = (queryOverride ?? schoolQuery).trim();
    setIsSearchingSchools(true);
    setSchoolNotice(null);

    try {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name, organization_id, city, state_region, country_code, location")
        .eq("verification_status", "VERIFIED")
        .limit(200);

      if (error) {
        throw error;
      }

      const rows = (data ?? []) as Array<{
        id: string;
        name: string;
        organization_id: string;
        city: string | null;
        state_region: string | null;
        country_code: string;
        location: unknown;
      }>;

      const parsed = rows
        .map((school) => {
          const location = school.location && typeof school.location === "object" && "coordinates" in school.location
            ? (school.location as { coordinates?: [number, number] }).coordinates
            : null;

          let latitude: number | null = null;
          let longitude: number | null = null;
          if (Array.isArray(location) && location.length >= 2) {
            longitude = Number(location[0]);
            latitude = Number(location[1]);
          }

          let distanceKm: number | null = null;
          if (userLocation && latitude !== null && longitude !== null) {
            const toRad = (value: number) => (value * Math.PI) / 180;
            const earthRadiusKm = 6371;
            const dLat = toRad(latitude - userLocation.latitude);
            const dLon = toRad(longitude - userLocation.longitude);
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(userLocation.latitude)) * Math.cos(toRad(latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            distanceKm = 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          }

          return { ...school, latitude, longitude, distanceKm };
        })
        .filter((school) => {
          if (!query) {
            if (!userLocation) return true;
            return school.distanceKm !== null && school.distanceKm <= 250;
          }

          const haystack = [school.name, school.city, school.state_region, school.country_code].filter(Boolean).join(" ").toLowerCase();
          return haystack.includes(query.toLowerCase());
        })
        .sort((a, b) => {
          if (a.distanceKm === null && b.distanceKm === null) return a.name.localeCompare(b.name);
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        })
        .slice(0, 12)
        .map((school) => ({
          id: school.id,
          name: school.name,
          organization_id: school.organization_id,
          city: school.city,
          state_region: school.state_region,
          country_code: school.country_code,
        }));

      setSchoolResults(parsed);

      if (!parsed.length) {
        setSchoolNotice(query ? "No schools matched your school name or area. Try another name or use Nearby schools." : "No suggested schools were found. Try a school name or the Nearby schools button.");
      }
    } catch (error) {
      console.error("School search failed", error);
      setSchoolNotice("The school search is unavailable right now.");
      setSchoolResults([]);
    } finally {
      setIsSearchingSchools(false);
    }
  }, [schoolQuery, userLocation]);

  const findNearbySchools = useCallback(() => {
    if (!navigator.geolocation) {
      setSchoolNotice("This browser does not support location-based school search.");
      return;
    }

    setSchoolNotice("Finding schools near your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setSchoolQuery("");
        void searchSchools("");
      },
      () => {
        setSchoolNotice("Location access was denied. You can still search by school name or area.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [searchSchools]);

  const handleOpenSchool = useCallback(async (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setRecordNotice(null);
    await loadSchoolObservations(schoolId);
  }, [loadSchoolObservations]);

  const handleRecordSave = useCallback(async () => {
    if (!selectedObservationId || !selectedSchoolId) return;
    setIsSavingObservation(true);
    setRecordNotice(null);

    try {
      const { error } = await supabase
        .from("observations")
        .update({
          common_name: recordForm.common_name.trim() || null,
          scientific_name: recordForm.scientific_name.trim() || null,
          notes: recordForm.notes.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedObservationId)
        .eq("school_id", selectedSchoolId)
        .select("id")
        .single();

      if (error) throw error;

      setRecordNotice("Observation updated. You can keep refining the field notes and supporting evidence.");
      await loadSchoolObservations(selectedSchoolId);
    } catch (error) {
      console.error("Observation update failed", error);
      setRecordNotice("The observation could not be updated. Check the field notes and try again.");
    } finally {
      setIsSavingObservation(false);
    }
  }, [loadSchoolObservations, recordForm, selectedObservationId, selectedSchoolId]);

  const handleEvidenceUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length || !selectedObservationId) return;

    setIsUploadingEvidence(true);
    setRecordNotice(null);

    try {
      for (const file of files) {
        const trimmed = file.name.trim();
        if (!trimmed) continue;
        const extension = (trimmed.split(".").pop() || "jpg").toLowerCase();
        const storagePath = `${user?.id ?? "mentor"}/${selectedObservationId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("observation-evidence").upload(storagePath, file, { contentType: file.type || "image/jpeg", upsert: false });
        if (uploadError) throw uploadError;

        const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
        const { error: mediaError } = await supabase.from("observation_media").insert({
          observation_id: selectedObservationId,
          storage_path: storagePath,
          content_type: file.type || "image/jpeg",
          size_bytes: file.size,
          sha256,
        });
        if (mediaError) throw mediaError;
      }

      setRecordNotice("Images were attached successfully to the observation record.");
      await loadSchoolObservations(selectedSchoolId!);
    } catch (error) {
      console.error("Evidence upload failed", error);
      setRecordNotice("One or more image files could not be uploaded. Please check the file size and format.");
    } finally {
      setIsUploadingEvidence(false);
      event.target.value = "";
    }
  }, [loadSchoolObservations, selectedObservationId, selectedSchoolId, user]);

  const handleAssignSchool = useCallback(async (schoolId: string) => {
    if (!user) {
      setSchoolNotice("Sign in to add a school to your mentoring list.");
      return;
    }

    const { data: selectedSchool, error: schoolError } = await supabase
      .from("schools")
      .select("id, organization_id, name")
      .eq("id", schoolId)
      .maybeSingle();

    if (schoolError || !selectedSchool) {
      setSchoolNotice("That school could not be found.");
      return;
    }

    const { data: existingAssignment } = await supabase
      .from("mentor_assignments")
      .select("id")
      .eq("mentor_id", user.id)
      .eq("school_id", schoolId)
      .maybeSingle();

    if (existingAssignment) {
      setSchoolNotice(`${selectedSchool.name} is already in your mentoring list.`);
      return;
    }

    const { error: insertError } = await supabase.from("mentor_assignments").insert({
      organization_id: selectedSchool.organization_id,
      school_id: selectedSchool.id,
      mentor_id: user.id,
      status: "ACTIVE",
    });

    if (insertError) {
      setSchoolNotice(insertError.message || "The school could not be added to your portfolio.");
      return;
    }

    setSchoolNotice(`${selectedSchool.name} was added to your mentor portfolio.`);
    setShowSchoolSearch(false);
    setSchoolQuery("");
    setSchoolResults([]);
    await refreshDashboard(user.id);
  }, [refreshDashboard, user]);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(async ({ data, error: userError }) => {
      if (!active) return;
      if (userError || !data.user) {
        setUser(null);
        setLoading(false);
        setAuthReady(true);
        return;
      }
      setUser(data.user);
      await refreshDashboard(data.user.id);
    });

    return () => {
      active = false;
    };
  }, [refreshDashboard]);

  const mentorName = user?.email ? user.email.split("@")[0].replace(/[._-]+/g, " ") : "mentor";
  const titleName = mentorName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Mentor";

  const selectedRecord = schoolObservations.find((record) => record.id === selectedObservationId) ?? null;
  const sessionSchool = dashboard.schools[0]?.school_name ?? "No school assigned yet";

  if (authReady && !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f6f1] px-4">
        <section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto size-9 text-amber-600" />
          <h1 className="mt-4 font-serif text-3xl text-emerald-950">Mentor sign-in required</h1>
          <p className="mt-3 text-sm text-slate-600">Please sign in to view your mentoring portfolio and school assignments.</p>
          <Link href="/auth" className="mt-5 inline-block text-sm font-bold text-emerald-800">Sign in securely</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="role-page">
      <aside className="role-rail">
        <Logo />
        <nav aria-label="Mentor navigation">
          <a className="active" href="/mentor">Overview</a>
          <a href="#schools">My schools</a>
          <a href="#activity">Activity</a>
          <a href="#sessions">Sessions</a>
          <a href="#resources">Resources</a>
        </nav>
        <div className="rail-person">
          <span>{titleName.slice(0, 2).toUpperCase() || "ME"}</span>
          <div>
            <strong>{titleName}</strong>
            <small>Verified GeoMentor</small>
          </div>
        </div>
      </aside>
      <section className="role-main">
        <header className="role-topbar">
          <Link href="/">← Back to home</Link>
          <span className="role-chip">Mentor workspace</span>
        </header>
        <div className="role-content">
          <div className="role-welcome">
            <div>
              <span className="eyebrow">{loading ? "LOADING" : "LIVE PORTFOLIO"}</span>
              <h1>{user ? `Good morning, ${titleName}.` : "Mentor workspace"}</h1>
              <p>
                {loading
                  ? "Loading your live mentoring portfolio..."
                  : `${dashboard.assigned_schools || 0} school${dashboard.assigned_schools === 1 ? "" : "s"} are active in your mentoring portfolio today.`}
              </p>
            </div>
            <button type="button" onClick={() => setShowPlanner(true)} className="rounded-lg bg-[#0b4436] px-4 py-2.5 text-xs font-bold text-white">Schedule group session</button>
          </div>

          {showPlanner && (
            <section className="role-panel">
              <div className="role-panel-heading">
                <div>
                  <span className="eyebrow">SESSION PLANNER</span>
                  <h2>Schedule a live mentoring session</h2>
                </div>
                <button type="button" onClick={() => setShowPlanner(false)} className="text-xs font-bold text-slate-500">Close</button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <strong className="block text-sm text-emerald-900">School</strong>
                  <span className="mt-1 block text-sm text-slate-700">{sessionSchool}</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <strong className="block text-sm text-emerald-900">Focus</strong>
                  <span className="mt-1 block text-sm text-slate-700">Field observation review and student feedback</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setShowPlanner(false)} className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white">Save session</button>
                <button type="button" onClick={() => setShowPlanner(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700">Dismiss</button>
              </div>
            </section>
          )}

          {showSchoolSearch && (
            <section className="role-panel">
              <div className="role-panel-heading">
                <div>
                  <span className="eyebrow">ADD SCHOOL</span>
                  <h2>Search by area or school name</h2>
                </div>
                <button type="button" onClick={() => setShowSchoolSearch(false)} className="text-xs font-bold text-slate-500">Close</button>
              </div>
              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <label className="flex min-h-12 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
                  <Search className="size-4 text-slate-400" />
                  <input
                    value={schoolQuery}
                    onChange={(event) => setSchoolQuery(event.target.value)}
                    onFocus={() => {
                      setShowSchoolSearch(true);
                      void searchSchools("");
                    }}
                    placeholder="Search by school name, city, state or area"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </label>
                <button type="button" onClick={findNearbySchools} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">
                  <MapPin className="size-3.5" /> School around me
                </button>
                <button type="button" onClick={() => void searchSchools()} className="rounded-lg bg-[#0b4436] px-4 py-2 text-xs font-bold text-white">Search</button>
              </div>
              {schoolNotice && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{schoolNotice}</p>}
              <div className="mt-4 grid gap-3">
                {isSearchingSchools ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600">
                    <LoaderCircle className="size-4 animate-spin text-emerald-700" />
                    Loading suggested schools...
                  </div>
                ) : schoolResults.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">
                    Suggestions will appear here as you search or use your current location.
                  </div>
                ) : (
                  schoolResults.map((school) => (
                    <div key={school.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <strong className="block truncate text-sm text-emerald-900">{school.name}</strong>
                        <span className="text-xs text-slate-500">
                          {school.city || school.state_region || "Area not set"}, {school.country_code}
                        </span>
                      </div>
                      <button type="button" onClick={() => void handleAssignSchool(school.id)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-[10px] font-bold text-white">
                        <Plus className="size-3.5" /> Add school
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          <section className="mentor-kpis" aria-label="Mentor summary">
            <article>
              <small>ASSIGNED SCHOOLS</small>
              <strong>{loading ? 0 : dashboard.assigned_schools}</strong>
              <em>{dashboard.students ? `${dashboard.students} student observers` : "No active roster yet"}</em>
            </article>
            <article>
              <small>AWAITING GUIDANCE</small>
              <strong>{loading ? 0 : dashboard.pending_guidance}</strong>
              <em>{dashboard.pending_guidance ? `${dashboard.pending_guidance} active review items` : "No open review items"}</em>
            </article>
            <article>
              <small>VERIFIED THIS TERM</small>
              <strong>{loading ? 0 : dashboard.verified_this_term}</strong>
              <em>Across live school observations</em>
            </article>
          </section>

          <div className="role-grid">
            <section className="role-panel" id="schools">
              <div className="role-panel-heading">
                <div>
                  <span className="eyebrow">YOUR PORTFOLIO</span>
                  <h2>Assigned schools</h2>
                </div>
                <button type="button" onClick={() => {
                  setShowSchoolSearch(true);
                  void searchSchools("");
                }} className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Plus className="size-3.5" /> Add school
                </button>
              </div>
              <div className="school-list">
                {dashboard.schools.length === 0 ? (
                  <article>
                    <div style={{ padding: "1rem 0" }}>
                      <h3>No schools assigned yet</h3>
                      <p>{error ? error : "Search by area or school name, then add a school to your mentoring list."}</p>
                    </div>
                  </article>
                ) : (
                  dashboard.schools.map((school, index) => (
                    <article key={school.school_id}>
                      <span className="school-initials">{school.school_name.slice(0, 2).toUpperCase()}</span>
                      <div>
                        <h3>{school.school_name}</h3>
                        <p>
                          {school.students} students · {school.observations} observations
                        </p>
                        <small>{school.pending_guidance} pending guidance</small>
                      </div>
                      <span className={`health health-${index % 2}`}>{school.health}</span>
                      <a href="#activity" aria-label={`Open ${school.school_name}`}>
                        →
                      </a>
                    </article>
                  ))
                )}
              </div>
            </section>

            <aside className="role-panel guidance-panel" id="activity">
              <span className="eyebrow">GUIDANCE REQUESTS</span>
              <h2>Students need your insight</h2>
              {dashboard.guidance.length === 0 ? (
                <div className="guidance-item">
                  <span className="species-spot">✦</span>
                  <div>
                    <strong>No active review requests</strong>
                    <small>Everything is up to date</small>
                    <p>Your review queue will populate when school submissions are waiting for your feedback.</p>
                  </div>
                </div>
              ) : (
                dashboard.guidance.map((request) => (
                  <div className="guidance-item" key={request.id}>
                    <span className="species-spot">✦</span>
                    <div>
                      <strong>{request.title}</strong>
                      <small>{request.school_name}</small>
                      <p>{request.detail}</p>
                    </div>
                  </div>
                ))
              )}
              <button type="button" onClick={() => setShowGuidanceQueue((current) => !current)} className="secondary-button">
                {showGuidanceQueue ? "Hide guidance queue" : "Open guidance queue"}
              </button>
              {showGuidanceQueue && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  {dashboard.guidance.length === 0 ? "No guidance items are waiting right now." : dashboard.guidance.map((item) => `${item.school_name}: ${item.title}`).join(" | ")}
                </div>
              )}
            </aside>
          </div>

          <section className="role-panel session-panel" id="sessions">
            <div>
              <span className="eyebrow">NEXT SUPERVISED SESSION</span>
              <h2>{dashboard.schools[0]?.school_name ? `School mentoring at ${dashboard.schools[0].school_name}` : "No session scheduled yet"}</h2>
              <p>
                {dashboard.schools[0]
                  ? `${dashboard.schools[0].school_name} · Group review and field planning · this week`
                  : "Create a live session once a school assignment is active."}
              </p>
            </div>
            <div className="attendee-stack">
              <span>AO</span>
              <span>TO</span>
              <span>IM</span>
              <span>+{dashboard.students || 0}</span>
            </div>
            <button type="button" onClick={() => setShowSessionPlan((current) => !current)} className="draft-button">
              {showSessionPlan ? "Hide session plan" : "View session plan"}
            </button>
            {showSessionPlan && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                {dashboard.schools[0]
                  ? `Session plan for ${dashboard.schools[0].school_name}: review student evidence, discuss field safety, and confirm mentor feedback timestamps.`
                  : "Add a school to generate a live session plan."}
              </div>
            )}
          </section>

          <section className="role-panel" id="resources">
            <div className="role-panel-heading">
              <div>
                <span className="eyebrow">READY TO TEACH</span>
                <h2>School record viewer</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">CAPTURES</p>
                {dashboard.schools.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-500">Add a school to begin reviewing captures.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {dashboard.schools.map((school) => (
                      <button
                        key={school.school_id}
                        type="button"
                        onClick={() => void handleOpenSchool(school.school_id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${selectedSchoolId === school.school_id ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"}`}
                      >
                        <strong className="block font-bold">{school.school_name}</strong>
                        <span className="mt-1 block text-[10px] text-slate-500">{school.observations} captures</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                {selectedSchoolId && schoolObservations.length === 0 ? (
                  <div>
                    <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">NO CAPTURES YET</p>
                    <p className="mt-3 text-sm text-slate-600">This school is assigned, but it does not yet have any field captures to review.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">SELECTED CAPTURE</p>
                        <h3 className="mt-1 font-serif text-2xl text-emerald-950">{selectedRecord?.common_name || selectedRecord?.scientific_name || selectedRecord?.observation_type || "School evidence"}</h3>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                        {selectedRecord?.verification_status || "READY"}
                      </span>
                    </div>

                    {selectedRecord && (
                      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                        <div>
                          <small className="block text-[10px] font-black tracking-[.14em] text-slate-500">TYPE</small>
                          <strong className="mt-1 block text-sm text-emerald-950">{selectedRecord.observation_type}</strong>
                        </div>
                        <div>
                          <small className="block text-[10px] font-black tracking-[.14em] text-slate-500">STATUS</small>
                          <strong className="mt-1 block text-sm text-emerald-950">{selectedRecord.verification_status}</strong>
                        </div>
                        <div>
                          <small className="block text-[10px] font-black tracking-[.14em] text-slate-500">DATE</small>
                          <strong className="mt-1 block text-sm text-emerald-950">{new Date(selectedRecord.observed_at).toLocaleString()}</strong>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="grid gap-1 text-xs font-bold text-slate-700">
                        <span>Common name</span>
                        <input value={recordForm.common_name} onChange={(event) => setRecordForm((current) => ({ ...current, common_name: event.target.value }))} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800" placeholder="e.g. African mahogany" />
                      </label>

                      <label className="grid gap-1 text-xs font-bold text-slate-700">
                        <span>Scientific name</span>
                        <input value={recordForm.scientific_name} onChange={(event) => setRecordForm((current) => ({ ...current, scientific_name: event.target.value }))} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-slate-800" placeholder="e.g. Khaya senegalensis" />
                      </label>
                    </div>

                    <label className="mt-4 grid gap-1 text-xs font-bold text-slate-700">
                      <span>Field notes</span>
                      <textarea value={recordForm.notes} onChange={(event) => setRecordForm((current) => ({ ...current, notes: event.target.value }))} rows={6} className="rounded-lg border border-slate-300 bg-white p-3 text-sm font-normal leading-6 text-slate-800" placeholder="Add habitat, health, condition, location notes, and any extra context from the field capture." />
                    </label>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => void handleRecordSave()} disabled={isSavingObservation} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
                        <PencilLine className="size-3.5" /> {isSavingObservation ? "Saving..." : "Save record"}
                      </button>

                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">
                        <Upload className="size-3.5" /> {isUploadingEvidence ? "Uploading..." : "Add images"}
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => void handleEvidenceUpload(event)} />
                      </label>
                    </div>

                    {recordNotice && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{recordNotice}</p>}

                    {selectedRecord && (recordImages[selectedRecord.id]?.length ?? 0) > 0 && (
                      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-[10px] font-black tracking-[.18em] text-emerald-700">IMAGE EVIDENCE</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {(recordImages[selectedRecord.id] ?? []).map((url, index) => (
                            <img key={`${selectedRecord.id}-${index}`} src={url} alt={`${selectedRecord.common_name || "School biodiversity"} evidence ${index + 1}`} className="h-40 w-full rounded-lg border border-slate-200 object-cover" />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {schoolObservations.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-xs text-slate-500">No observations are currently available for this school.</div>
                      ) : (
                        schoolObservations.map((record) => (
                          <button
                            key={record.id}
                            type="button"
                            onClick={() => {
                              setSelectedObservationId(record.id);
                              setRecordForm({
                                common_name: record.common_name ?? "",
                                scientific_name: record.scientific_name ?? "",
                                notes: record.notes ?? "",
                              });
                            }}
                            className={`rounded-xl border p-3 text-left ${selectedObservationId === record.id ? "border-emerald-700 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
                          >
                            <strong className="block text-sm text-emerald-900">{record.common_name || record.scientific_name || record.observation_type}</strong>
                            <span className="mt-1 block text-[10px] text-slate-500">{new Date(record.observed_at).toLocaleDateString()} · {record.observation_type}</span>
                            <span className="mt-2 block text-[10px] font-bold text-slate-600">{record.observation_media.length} image{record.observation_media.length === 1 ? "" : "s"}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase/client";

type Coordinates = { latitude: number; longitude: number; accuracy: number };
type AISuggestion = {
  observation_type: string;
  common_name: string;
  scientific_name: string;
  notes: string;
  confidence: number;
};
type Draft = {
  id: string;
  category: string;
  commonName: string;
  scientificName: string;
  notes: string;
  observedAt: string;
  coordinates: Coordinates | null;
  photoNames: string[];
  photos: Array<{ blob: Blob; type: string; name: string; size: number }>;
  updatedAt: string;
};

const DB_NAME = "geomentor-field";
const STORE_NAME = "drafts";

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveDraftRecord(draft: Draft) {
  const database = await openDraftDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(draft);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

function subscribeToConnectivity(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function FieldCapture() {
  const [category, setCategory] = useState("TREE");
  const [commonName, setCommonName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [notes, setNotes] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [gpsState, setGpsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const online = useSyncExternalStore(subscribeToConnectivity, () => navigator.onLine, () => true);

  const observedAt = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    return () => {
      for (const url of photoUrls) URL.revokeObjectURL(url);
    };
  }, [photoUrls]);

  function createDraft(): Draft {
    return {
      id: crypto.randomUUID(),
      category,
      commonName: commonName.trim(),
      scientificName: scientificName.trim(),
      notes: notes.trim(),
      observedAt,
      coordinates,
      photoNames: photos.map((photo) => photo.name),
      photos: photos.map((photo) => ({ blob: photo, type: photo.type, name: photo.name, size: photo.size })),
      updatedAt: new Date().toISOString(),
    };
  }

  function captureLocation() {
    setMessage(null);
    if (!navigator.geolocation) {
      setGpsState("error");
      setMessage("Location is not available on this device. You can still save an offline draft.");
      return;
    }
    setGpsState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGpsState("ready");
      },
      () => {
        setGpsState("error");
        setMessage("We could not read your location. Check permission settings and try again outdoors.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setMessage(null);
    if (!files.length) return;

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setMessage("Choose image files captured by your camera or photo library.");
        event.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage("One of the files is larger than 10 MB. Choose smaller images before continuing.");
        event.target.value = "";
        return;
      }
      validFiles.push(file);
    }

    if (photos.length + validFiles.length > 5) {
      setMessage("You can submit up to 5 photos for one observation.");
      event.target.value = "";
      return;
    }

    const nextUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPhotos((current) => [...current, ...validFiles]);
    setPhotoUrls((current) => [...current, ...nextUrls]);
    event.target.value = "";

    // Auto-analyze the first photo if available
    if (!aiSuggestion && validFiles.length > 0) {
      analyzePhoto(validFiles[0]);
    }
  }

  async function analyzePhoto(file: File) {
    if (analyzing) return;
    setAnalyzing(true);
    setMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string)?.split(",")[1];
        if (!base64) throw new Error("Could not read file");

        const response = await fetch("/api/analyze-observation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });

        if (!response.ok) throw new Error("Analysis failed");
        const suggestion = (await response.json()) as AISuggestion;
        setAiSuggestion(suggestion);

        // Auto-fill form with AI suggestions
        setCategory(suggestion.observation_type);
        if (!commonName) setCommonName(suggestion.common_name);
        if (!scientificName) setScientificName(suggestion.scientific_name);
        if (!notes) setNotes(suggestion.notes);

        if (suggestion.confidence > 0) {
          setMessage(`AI identified: ${suggestion.common_name}. Please review and adjust before submitting.`);
        }
      };
      reader.onerror = () => {
        setMessage("Could not read the image file.");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Photo analysis error:", error);
      setMessage("Photo analysis unavailable. Please describe the organism manually.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveDraft() {
    setSaving(true);
    setMessage(null);
    try {
      await saveDraftRecord(createDraft());
      setMessage("Draft saved securely on this device. It will remain pending until you submit it.");
    } catch {
      setMessage("The draft could not be saved on this device. Keep this page open and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitForReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photos.length || !coordinates) {
      setMessage("Add at least one photo and capture your GPS location before submitting for teacher review.");
      return;
    }
    if (!navigator.onLine) {
      await saveDraft();
      setMessage("You are offline. The observation is saved on this device and can be submitted when you reconnect.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error("SIGN_IN_REQUIRED");

      const { data: memberships, error: membershipError } = await supabase
        .from("organization_memberships")
        .select("organization_id, role, status")
        .eq("user_id", authData.user.id)
        .eq("status", "VERIFIED")
        .limit(1);
      if (membershipError) throw membershipError;
      const membership = memberships?.[0];
      if (!membership) throw new Error("MEMBERSHIP_REQUIRED");

      const { data: schools, error: schoolError } = await supabase
        .from("schools")
        .select("id")
        .eq("organization_id", membership.organization_id)
        .limit(1);
      if (schoolError) throw schoolError;
      const school = schools?.[0];
      if (!school) throw new Error("SCHOOL_REQUIRED");

      const observationId = crypto.randomUUID();
      const { error: observationError } = await supabase.from("observations").insert({
        id: observationId,
        organization_id: membership.organization_id,
        school_id: school.id,
        observer_id: authData.user.id,
        observation_type: category,
        common_name: commonName.trim() || null,
        scientific_name: scientificName.trim() || null,
        notes: notes.trim(),
        observed_at: observedAt,
        location: `SRID=4326;POINT(${coordinates.longitude} ${coordinates.latitude})`,
        coordinate_accuracy_m: Math.min(coordinates.accuracy, 50000),
        verification_status: "PENDING",
        visibility: "SCHOOL",
      });
      if (observationError) throw observationError;

      for (const photo of photos) {
        const extension = photo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const storagePath = `${authData.user.id}/${observationId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("observation-evidence").upload(storagePath, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;

        const digest = await crypto.subtle.digest("SHA-256", await photo.arrayBuffer());
        const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
        const { error: mediaError } = await supabase.from("observation_media").insert({
          observation_id: observationId,
          storage_path: storagePath,
          content_type: photo.type,
          size_bytes: photo.size,
          sha256,
        });
        if (mediaError) throw mediaError;
      }

      setMessage("Observation submitted securely. A teacher must review it before expert verification.");
      setCommonName("");
      setScientificName("");
      setNotes("");
      setCoordinates(null);
      setGpsState("idle");
      setPhotos([]);
      setAiSuggestion(null);
      for (const url of photoUrls) URL.revokeObjectURL(url);
      setPhotoUrls([]);
    } catch (error) {
      await saveDraftRecord(createDraft());
      const reason = error instanceof Error ? error.message : "";
      if (reason === "SIGN_IN_REQUIRED") setMessage("Draft saved on this device. Sign in with your invited school email before submitting.");
      else if (reason === "MEMBERSHIP_REQUIRED") setMessage("Draft saved. Your school administrator must approve your membership before you can submit.");
      else if (reason === "SCHOOL_REQUIRED") setMessage("Draft saved. Your organization does not yet have a school configured.");
      else setMessage("The live submission could not be completed, so your draft was kept safely on this device. Try again after the school database is activated.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="capture-page">
      <header className="capture-header">
        <Logo />
        <span className="sync-state"><i />{online ? "Supabase connected" : "Offline-ready"}</span>
      </header>

      <div className="capture-layout">
        <section className="capture-intro">
          <Link className="back-link" href="/">← Back to overview</Link>
          <span className="eyebrow">FIELD CAPTURE · STAFF SCHOOL</span>
          <h1>Record what you observe.</h1>
          <p>Take a clear photo, capture the location and describe what you can see. It is okay if you do not know the species yet.</p>
          <div className="safety-note">
            <strong>Protect people and wildlife</strong>
            <p>Do not photograph another student’s face, disturb wildlife or reveal the exact location of a sensitive species.</p>
          </div>
          <ol className="capture-steps" aria-label="Observation progress">
            <li className="current"><span>1</span>Evidence</li>
            <li><span>2</span>Details</li>
            <li><span>3</span>Review</li>
          </ol>
        </section>

        <form className="capture-form" onSubmit={submitForReview}>
          <div className="form-section">
            <div className="form-heading"><span>1</span><div><h2>Add field photos</h2><p>Attach up to 5 clear images without identifiable people.</p></div></div>
            <label className={`photo-dropzone ${photoUrls.length ? "has-photo" : ""}`}>
              {photoUrls.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {photoUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-white/40 bg-white/20">
                      {/* A temporary object URL from the user-selected local file cannot use the image optimizer. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Observation preview ${index + 1}`} className="h-28 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : <span className="camera-symbol">◎</span>}
              <strong>{photos.length ? "Add more photos" : "Take or choose photos"}</strong>
              <small>JPG, PNG or WebP · maximum 10 MB each</small>
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={handlePhoto} />
            </label>
          </div>

          <div className="form-section">
            <div className="form-heading"><span>2</span><div><h2>Capture location</h2><p>GPS accuracy is saved with the observation.</p></div></div>
            <button className="location-button" type="button" onClick={captureLocation} disabled={gpsState === "loading"}>
              <span>⌖</span>
              <span><strong>{gpsState === "loading" ? "Finding your location…" : gpsState === "ready" ? "Location captured" : "Use my current location"}</strong><small>{coordinates ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)} · ±${Math.round(coordinates.accuracy)} m` : "Best results are outdoors"}</small></span>
              {gpsState === "ready" && <em>✓</em>}
            </button>
          </div>

          <div className="form-section">
            <div className="form-heading"><span>3</span><div><h2>Describe the observation</h2><p>Experts can help with identification later.</p></div></div>
            
            {aiSuggestion && aiSuggestion.confidence > 0 && (
              <div className="ai-suggestion-panel" style={{ 
                marginBottom: "1.5rem", 
                padding: "1rem", 
                borderRadius: "0.75rem", 
                backgroundColor: "rgba(34, 197, 94, 0.1)", 
                border: "1px solid rgba(34, 197, 94, 0.3)" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <strong style={{ color: "#065f46" }}>🤖 AI Suggestion</strong>
                  <span style={{ fontSize: "0.875rem", color: "#059669" }}>
                    {Math.round(aiSuggestion.confidence * 100)}% confident
                  </span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "#065f46", lineHeight: "1.5" }}>
                  <p><strong>Type:</strong> {aiSuggestion.observation_type}</p>
                  <p><strong>Common name:</strong> {aiSuggestion.common_name}</p>
                  <p><strong>Scientific name:</strong> {aiSuggestion.scientific_name}</p>
                  <p><strong>Notes:</strong> {aiSuggestion.notes}</p>
                </div>
              </div>
            )}

            <div className="field-grid">
              <label><span>Observation type</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="TREE">Tree</option><option value="PLANT">Plant</option><option value="BIRD">Bird</option><option value="INSECT">Insect</option><option value="POLLINATOR">Pollinator</option><option value="FUNGI">Fungi</option><option value="OTHER">Other</option></select></label>
              <label><span>Common or local name <em>Optional</em></span><input value={commonName} onChange={(event) => setCommonName(event.target.value)} maxLength={120} placeholder="What do you call it?" /></label>
              <label><span>Scientific name <em>Optional</em></span><input value={scientificName} onChange={(event) => setScientificName(event.target.value)} maxLength={200} placeholder="Genus species (e.g., Homo sapiens)" /></label>
              <label className="full-field"><span>What did you notice?</span><textarea required value={notes} onChange={(event) => setNotes(event.target.value)} minLength={10} maxLength={1000} placeholder="Describe colour, size, behaviour, condition or habitat…" /><small>{notes.length}/1000</small></label>
            </div>
          </div>

          {message && <div className="form-message" role="status">{message}</div>}
          <div className="form-actions"><Button type="button" variant="secondary" onClick={saveDraft} disabled={saving}>{saving ? "Saving…" : "Save offline draft"}</Button><Button type="submit" disabled={saving}>{saving ? "Submitting securely…" : "Submit for teacher review"} <span>→</span></Button></div>
        </form>
      </div>
    </main>
  );
}

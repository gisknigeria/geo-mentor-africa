"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Logo } from "../../components/app/logo";
import { Button } from "../../components/ui/button";

type Coordinates = { latitude: number; longitude: number; accuracy: number };
type Draft = {
  id: string;
  category: string;
  commonName: string;
  notes: string;
  observedAt: string;
  coordinates: Coordinates | null;
  photoName: string | null;
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

export function FieldCapture() {
  const [category, setCategory] = useState("TREE");
  const [commonName, setCommonName] = useState("");
  const [notes, setNotes] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [gpsState, setGpsState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const observedAt = useMemo(() => new Date().toISOString(), []);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

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
    const selected = event.target.files?.[0] ?? null;
    setMessage(null);
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setMessage("Choose an image file captured by your camera or photo library.");
      event.target.value = "";
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setMessage("That photo is larger than 10 MB. Choose a smaller image before continuing.");
      event.target.value = "";
      return;
    }
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhoto(selected);
    setPhotoUrl(URL.createObjectURL(selected));
  }

  async function saveDraft() {
    setSaving(true);
    setMessage(null);
    try {
      await saveDraftRecord({
        id: crypto.randomUUID(),
        category,
        commonName: commonName.trim(),
        notes: notes.trim(),
        observedAt,
        coordinates,
        photoName: photo?.name ?? null,
        updatedAt: new Date().toISOString(),
      });
      setMessage("Draft saved securely on this device. It will remain pending until you submit it.");
    } catch {
      setMessage("The draft could not be saved on this device. Keep this page open and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitForReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo || !coordinates) {
      setMessage("Add a photo and capture your GPS location before submitting for teacher review.");
      return;
    }
    await saveDraft();
    setMessage("Observation added to the pending sync queue. A teacher must review it before expert verification.");
  }

  return (
    <main className="capture-page">
      <header className="capture-header">
        <Logo />
        <span className="sync-state"><i />Offline-ready</span>
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
            <div className="form-heading"><span>1</span><div><h2>Add a field photo</h2><p>Use one clear image without identifiable people.</p></div></div>
            <label className={`photo-dropzone ${photoUrl ? "has-photo" : ""}`}>
              {photoUrl ? (
                // A temporary object URL from the user-selected local file cannot use the image optimizer.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Selected field observation preview" />
              ) : <span className="camera-symbol">◎</span>}
              <strong>{photo ? "Replace photo" : "Take or choose a photo"}</strong>
              <small>JPG, PNG or WebP · maximum 10 MB</small>
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handlePhoto} />
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
            <div className="field-grid">
              <label><span>Observation type</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="TREE">Tree</option><option value="PLANT">Plant</option><option value="BIRD">Bird</option><option value="INSECT">Insect</option><option value="POLLINATOR">Pollinator</option><option value="FUNGI">Fungi</option><option value="OTHER">Other</option></select></label>
              <label><span>Common or local name <em>Optional</em></span><input value={commonName} onChange={(event) => setCommonName(event.target.value)} maxLength={120} placeholder="What do you call it?" /></label>
              <label className="full-field"><span>What did you notice?</span><textarea required value={notes} onChange={(event) => setNotes(event.target.value)} minLength={10} maxLength={1000} placeholder="Describe colour, size, behaviour, condition or habitat…" /><small>{notes.length}/1000</small></label>
            </div>
          </div>

          {message && <div className="form-message" role="status">{message}</div>}
          <div className="form-actions"><Button type="button" variant="secondary" onClick={saveDraft} disabled={saving}>{saving ? "Saving…" : "Save offline draft"}</Button><Button type="submit">Submit for teacher review <span>→</span></Button></div>
        </form>
      </div>
    </main>
  );
}

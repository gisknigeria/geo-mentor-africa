"use client";

import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

type Point = { id: string; label: string; latitude: number; longitude: number; category: string };

export function PublicObservationMap({ points, selectedId, onSelect }: { points: Point[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !element.current) return;
      if (!map.current) {
        map.current = L.map(element.current, { minZoom: 2, worldCopyJump: true }).setView([2, 20], 3);
        L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>', maxZoom: 19 }).addTo(map.current);
      }
      layer.current?.remove();
      layer.current = L.layerGroup().addTo(map.current);
      const valid = points.filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
      valid.forEach((point) => {
        const active = point.id === selectedId;
        const marker = L.circleMarker([point.latitude, point.longitude], { radius: active ? 10 : 7, color: "#fff", weight: 3, fillColor: active ? "#a3e635" : point.category === "Plants" ? "#166534" : point.category === "Microbial" ? "#6d28d9" : "#b45309", fillOpacity: .95 }).addTo(layer.current!);
        marker.bindTooltip(`${point.label} · ${point.category}`, { direction: "top" });
        marker.on("click", () => onSelect(point.id));
      });
      if (valid.length) map.current.fitBounds(L.latLngBounds(valid.map((point) => [point.latitude, point.longitude] as [number, number])), { padding: [40, 40], maxZoom: 13 });
    });
    return () => { cancelled = true; };
  }, [points, selectedId, onSelect]);
  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);
  return <div ref={element} className="absolute inset-0" aria-label="Interactive map of public verified biodiversity observations" />;
}

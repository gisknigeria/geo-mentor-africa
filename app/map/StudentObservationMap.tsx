"use client";

import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

type ObservationPoint = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export function StudentObservationMap({ observations, selectedId, onSelect, onMove }: { observations: ObservationPoint[]; selectedId: string | null; onSelect: (id: string) => void; onMove: (id: string, latitude: number, longitude: number) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !element.current) return;
      if (!map.current) {
        map.current = L.map(element.current, { zoomControl: true }).setView([7.412, 3.904], 15);
        const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 });
        const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "Tiles &copy; Esri", maxZoom: 19 });
        const terrain = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenTopoMap contributors', maxZoom: 17 });
        street.addTo(map.current);
        L.control.layers({ "Street map": street, Satellite: satellite, Terrain: terrain }, undefined, { position: "topright" }).addTo(map.current);
      }

      layer.current?.remove();
      layer.current = L.layerGroup().addTo(map.current);
      if (observations.length) {
        const bounds = L.latLngBounds(observations.map((point) => [point.latitude, point.longitude] as [number, number]));
        map.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 18 });
      }

      observations.forEach((point) => {
        const biodiversityIcon = L.divIcon({ className: "biodiversity-map-marker", html: "<span aria-hidden=\"true\">✦</span>", iconSize: [34, 34], iconAnchor: [17, 17] });
        const marker = L.marker([point.latitude, point.longitude], { draggable: true, icon: biodiversityIcon }).addTo(layer.current!);
        marker.bindTooltip(point.label, { direction: "top" });
        marker.bindPopup(`<strong>${point.label}</strong><br />Drag this marker to correct the capture location.`);
        marker.on("click", () => onSelect(point.id));
        marker.on("dragend", () => {
          const position = marker.getLatLng();
          onMove(point.id, position.lat, position.lng);
        });
        if (point.id === selectedId) marker.openPopup();
      });
    });
    return () => { cancelled = true; };
  }, [observations, selectedId, onMove, onSelect]);

  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);
  return <div ref={element} className="absolute inset-0" aria-label="Interactive biodiversity map. Drag a capture marker to correct its location." />;
}

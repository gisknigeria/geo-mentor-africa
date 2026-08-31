"use client";

import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

type Point = { latitude: number; longitude: number; id?: string };

export function SchoolLocationMap({ observations, schoolLocation, schoolName, onChoose }: { observations: Point[]; schoolLocation: Point | null; schoolName: string; onChoose?: (point: Point) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !element.current) return;
      if (!map.current) {
        map.current = L.map(element.current, { zoomControl: true }).setView([7.412, 3.904], 15);
        L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>', maxZoom: 19 }).addTo(map.current);
        map.current.on("click", (event) => onChoose?.({ latitude: event.latlng.lat, longitude: event.latlng.lng }));
      }
      layer.current?.remove();
      layer.current = L.layerGroup().addTo(map.current);
      const points = [...observations, ...(schoolLocation ? [schoolLocation] : [])];
      if (points.length) {
        const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude] as [number, number]));
        map.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 18 });
      }
      observations.forEach((point) => L.circleMarker([point.latitude, point.longitude], { radius: 7, color: "#fff", weight: 3, fillColor: "#0b4436", fillOpacity: 0.95 }).addTo(layer.current!).bindTooltip("Biodiversity capture"));
      if (schoolLocation) {
        const schoolIcon = L.divIcon({
          className: "school-map-marker",
          html: "<span aria-hidden=\"true\">S</span>",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        L.marker([schoolLocation.latitude, schoolLocation.longitude], { icon: schoolIcon })
          .addTo(layer.current)
          .bindTooltip(schoolName, { direction: "top", offset: [0, -16] })
          .bindPopup(`<strong>${schoolName}</strong><br />School location`);
      }
    });
    return () => { cancelled = true; };
  }, [observations, schoolLocation, onChoose]);

  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);
  return <div ref={element} className="absolute inset-0" aria-label="Interactive school map. Click to set the school location." />;
}

"use client";

import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

type Point = { latitude: number; longitude: number; id?: string; label?: string; details?: string };

export function SchoolLocationMap({ observations, schoolLocation, schoolName, boundary, boundaryMode, boundaryPoints, onChoose, onBoundaryPoint, onBoundaryChange }: { observations: Point[]; schoolLocation: Point | null; schoolName: string; boundary?: Point[]; boundaryMode?: boolean; boundaryPoints?: Point[]; onChoose?: (point: Point) => void; onBoundaryPoint?: (point: Point) => void; onBoundaryChange?: (points: Point[]) => void }) {
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
      map.current.off("click");
      map.current.on("click", (event) => {
        const point = { latitude: event.latlng.lat, longitude: event.latlng.lng };
        if (boundaryMode) onBoundaryPoint?.(point);
        else onChoose?.(point);
      });
      layer.current?.remove();
      layer.current = L.layerGroup().addTo(map.current);
      const points = [...observations, ...(schoolLocation ? [schoolLocation] : [])];
      if (points.length) {
        const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude] as [number, number]));
        map.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 18 });
      }
      observations.forEach((point) => L.circleMarker([point.latitude, point.longitude], { radius: 7, color: "#fff", weight: 3, fillColor: "#0b4436", fillOpacity: 0.95 }).addTo(layer.current!).bindTooltip(point.label || "Biodiversity capture").bindPopup(`<strong>${point.label || "Biodiversity capture"}</strong><br />${point.details || "Live school observation"}`));
      const shape = boundaryPoints?.length ? boundaryPoints : boundary;
      if (shape && shape.length >= 3) {
        L.polygon(shape.map((point) => [point.latitude, point.longitude] as [number, number]), { color: "#dc7b26", weight: 3, fillColor: "#f5a623", fillOpacity: 0.2 }).addTo(layer.current).bindTooltip("School boundary");
      }
      if (boundaryMode) {
        boundaryPoints?.forEach((point, index) => {
          const vertex = L.marker([point.latitude, point.longitude], { draggable: true, icon: L.divIcon({ className: "boundary-map-marker", html: "<span aria-hidden=\"true\"></span>", iconSize: [16, 16], iconAnchor: [8, 8] }) }).addTo(layer.current!).bindTooltip(`Boundary point ${index + 1}`);
          vertex.on("dragend", () => {
            const position = vertex.getLatLng();
            onBoundaryChange?.(boundaryPoints.map((item, itemIndex) => itemIndex === index ? { latitude: position.lat, longitude: position.lng } : item));
          });
        });
      } else {
        boundaryPoints?.forEach((point, index) => L.circleMarker([point.latitude, point.longitude], { radius: 5, color: "#fff", weight: 2, fillColor: "#dc7b26", fillOpacity: 1 }).addTo(layer.current!).bindTooltip(`Boundary point ${index + 1}`));
      }
      if (schoolLocation) {
        const schoolIcon = L.divIcon({
          className: "school-map-marker",
          html: "<span aria-hidden=\"true\">S</span>",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        const schoolMarker = L.marker([schoolLocation.latitude, schoolLocation.longitude], { icon: schoolIcon, draggable: true })
          .addTo(layer.current)
          .bindTooltip(schoolName, { direction: "top", offset: [0, -16] })
          .bindPopup(`<strong>${schoolName}</strong><br />School location`);
        schoolMarker.on("dragend", () => {
          const position = schoolMarker.getLatLng();
          onChoose?.({ latitude: position.lat, longitude: position.lng });
        });
      }
    });
    return () => { cancelled = true; };
  }, [observations, schoolLocation, schoolName, boundary, boundaryMode, boundaryPoints, onChoose, onBoundaryPoint, onBoundaryChange]);

  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);
  return <div ref={element} className="absolute inset-0" aria-label="Interactive school map. Click to set the school location." />;
}

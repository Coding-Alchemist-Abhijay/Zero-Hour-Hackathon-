"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Next.js (webpack)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function FitBounds({ bounds }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (!bounds || done.current) return;
    map.fitBounds(
      [
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ],
      { padding: [20, 20], maxZoom: 14 }
    );
    done.current = true;
  }, [map, bounds]);
  return null;
}

function LocationPicker({ onSelect }) {
  const map = useMap();
  useEffect(() => {
    if (!onSelect) return;
    const handler = (e) => onSelect(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => map.off("click", handler);
  }, [map, onSelect]);
  return null;
}

export function IssueMapInner({
  issues = [],
  center,
  zoom,
  bounds,
  onLocationSelect,
  showHeatLayer,
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bounds && <FitBounds bounds={bounds} />}
      {onLocationSelect && <LocationPicker onSelect={onLocationSelect} />}
      {issues.map((issue) => (
        <Marker
          key={issue.id}
          position={[issue.latitude, issue.longitude]}
          eventHandlers={
            onLocationSelect
              ? {}
              : {
                  click: () => window.open(`/dashboard/issues/${issue.id}`, "_self"),
                }
          }
        >
          <Popup>
            <div className="text-sm">
              <p className="font-medium">{issue.title}</p>
              <p className="text-muted-foreground">{issue.status} · {issue.category}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

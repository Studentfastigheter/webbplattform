"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

function svgIcon(color: string, size = 28, height = 42) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 28 42">
    <defs>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,.25)"/>
      </filter>
    </defs>
    <path d="M14 42 L0 16 H28 Z" fill="${color}" filter="url(#s)"/>
    <rect x="7" y="2" width="14" height="14" rx="7" fill="${color}" />
    <circle cx="14" cy="9" r="4.2" fill="white"/>
  </svg>`;
  return new L.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconRetinaUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 10],
  });
}

const markerIcon = svgIcon("#476e66", 32, 48);

export default function ListingMap({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  const position = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={false}
      className="w-full h-full"
      style={{ minHeight: "16rem", borderRadius: "0.75rem", overflow: "hidden" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={markerIcon}>
        <Popup>
          <div className="font-semibold">{title}</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

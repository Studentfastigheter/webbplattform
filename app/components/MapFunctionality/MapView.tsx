"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";

export type Listing = {
  id: number;
  title: string;
  city?: string;
  price?: number;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string | null; // används inte i kartan
  distanceToSchoolKm?: number | null;
};

/** Skapa pil-ikon (SVG) som data-URL */
function svgIcon(color: string, size = 28, height = 42) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 28 42">
    <defs>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,.25)"/>
      </filter>
    </defs>
    <!-- pil (pek nedåt) -->
    <path d="M14 42 L0 16 H28 Z" fill="${color}" filter="url(#s)"/>
    <!-- toppkropp -->
    <rect x="7" y="2" width="14" height="14" rx="7" fill="${color}" />
    <circle cx="14" cy="9" r="4.2" fill="white"/>
  </svg>`;
  return new L.Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconRetinaUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],   // spetsen i botten
    popupAnchor: [0, -height + 10],
  });
}

const iconDefault = svgIcon("#004225");           // CampusLyan-grön
const iconHighlight = svgIcon("#0a7a4a", 32, 48); // större & ljusare vid hover/selekt

// Fit på data
function FitOnData({
  listings,
  fallbackCenter,
}: {
  listings: Listing[];
  fallbackCenter: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    const pts = listings
      .filter(l => typeof l.latitude === "number" && typeof l.longitude === "number")
      .map(l => [l.latitude as number, l.longitude as number]) as [number, number][];

    if (pts.length >= 2) {
      map.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
    } else if (pts.length === 1) {
      map.setView(pts[0], 12);
    } else {
      map.setView(fallbackCenter, 5);
    }
  }, [listings, fallbackCenter, map]);
  return null;
}

// Tillåt både array eller {items:[]}
type ListingsInput = Listing[] | { items?: Listing[] } | undefined;

export default function MapView({
  listings,
  selectedId,
  onMarkerClick,
}: {
  listings?: ListingsInput;
  selectedId?: number | null;
  onMarkerClick?: (id: number) => void;
}) {
  const center = useMemo<[number, number]>(() => [59.334, 18.066], []);

  const rows: Listing[] = Array.isArray(listings)
    ? listings
    : (listings && "items" in listings && Array.isArray(listings.items))
      ? listings.items!
      : [];

  return (
    <MapContainer center={center} zoom={5} scrollWheelZoom className="w-full h-[420px]">
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitOnData listings={rows} fallbackCenter={center} />

      {rows
        .filter(l => typeof l.latitude === "number" && typeof l.longitude === "number")
        .map(l => {
          const isSelected = selectedId === l.id;
          return (
            <Marker
              key={l.id}
              position={[l.latitude as number, l.longitude as number]}
              icon={isSelected ? iconHighlight : iconDefault}
              eventHandlers={{ click: () => onMarkerClick?.(l.id) }}
            >
              <Popup>
                <div className="space-y-1 p-1">
                  <div className="font-semibold text-brand">{l.title}</div>
                  {l.city && <div className="text-sm text-muted">{l.city}</div>}
                  {typeof l.price === "number" && (
                    <div className="text-sm font-medium">{l.price} kr/mån</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

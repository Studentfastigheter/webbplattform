"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState, type ReactNode } from "react";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export type BaseMarker = {
  id: string;
  position: [number, number];
  popup?: ReactNode;
};

type BaseMapProps = {
  center?: [number, number];
  zoom?: number;
  markers?: BaseMarker[];
  className?: string;
};

const BaseMap: React.FC<BaseMapProps> = ({
  center = [59, 15], // mitten-ish av Sverige
  zoom = 5,
  markers = [],
  className,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className={className ?? "w-full rounded-2xl"}
        style={{ minHeight: 520, width: "100%" }}
        aria-hidden
      />
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className={className ?? "w-full rounded-2xl"}
      style={{
        height: "min(72vh, 760px)",
        minHeight: 600,
        width: "100%",
      }} // ensure Leaflet gets a set height
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {markers.map((marker) => (
        <Marker key={marker.id} position={marker.position}>
          {marker.popup && <Popup>{marker.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default BaseMap;

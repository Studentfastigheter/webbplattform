"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
  const mapRef = useRef<L.Map | null>(null);

  // Frys initial center/zoom så de inte hoppar om props ändras
  const [initialCenter] = useState<[number, number]>(center);
  const [initialZoom] = useState<number>(zoom);

  const applyFit = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (markers.length === 0) {
      // Inga markers → återgå till default-vy
      map.setView(initialCenter, initialZoom);
      return;
    }

    if (markers.length === 1) {
      map.setView(markers[0].position, 13);
      return;
    }

    const bounds = L.latLngBounds(markers.map((m) => m.position));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
  }, [markers, initialCenter, initialZoom]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fit till markers när de ändras och när kartan finns
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize();
    applyFit();
  }, [applyFit, markers.length]);

  // Refits på resize
  useEffect(() => {
    const handleResize = () => {
      if (!mapRef.current) return;
      mapRef.current.invalidateSize();
      applyFit();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyFit]);

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
      center={initialCenter}
      zoom={initialZoom}
      scrollWheelZoom
      className={className ?? "w-full rounded-2xl"}
      ref={mapRef} // <— ingen whenCreated, TS är nöjd
      style={{
        height: "min(72vh, 760px)",
        minHeight: 600,
        width: "100%",
      }}
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

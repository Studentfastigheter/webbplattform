"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
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

// ========= TYPER =========

export type PopupRenderer = (opts: {
  zoom: number;
  isActive: boolean;
}) => ReactNode;

export type BaseMarker = {
  id: string;
  position: [number, number];
  /**
   * Antingen ett statiskt ReactNode (som förr),
   * eller en funktion som får zoom + isActive så vi kan
   * växla mellan "light" och "detailed" content.
   */
  popup?: ReactNode | PopupRenderer;
};

export type BaseMapProps = {
  center?: [number, number];
  zoom?: number;
  markers?: BaseMarker[];
  className?: string;
  activeMarkerId?: string;
};

const CLUSTER_ZOOM_THRESHOLD = 10;
const DETAIL_ZOOM_THRESHOLD = 14;
const CLUSTER_RADIUS_PX = 48;

// ========= HJÄLPKOMPONENTER =========

const ZoomListener: React.FC<{ onZoomChange: (zoom: number) => void }> = ({
  onZoomChange,
}) => {
  useMapEvents({
    zoomend: (event) => {
      onZoomChange(event.target.getZoom());
    },
  });

  return null;
};

// ========= HUVUDKARTA =========

const BaseMap: React.FC<BaseMapProps> = ({
  center = [59, 15], // mitten-ish av Sverige
  zoom = 5,
  markers = [],
  className,
  activeMarkerId,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(zoom);
  const [activePopupId, setActivePopupId] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const lastFocusedMarkerId = useRef<string | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const manualPopupRef = useRef(false);

  // Frys initial center/zoom så de inte hoppar om props ändras
  const [initialCenter] = useState<[number, number]>(center);
  const [initialZoom] = useState<number>(zoom);

  const applyFit = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (markers.length === 0) {
      // Inga markers => återgå till default-vy
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

  useEffect(() => {
    if (mapRef.current) {
      setZoomLevel(mapRef.current.getZoom());
    }
  }, [isClient]);

  const hasActiveMarker =
    !!activeMarkerId && markers.some((m) => m.id === activeMarkerId);
  const suppressAutoFit = hasActiveMarker;

  // Auto-fit när markers ändras (t.ex. ny stad via sök)
  useEffect(() => {
    if (!mapRef.current || suppressAutoFit) return;
    mapRef.current.invalidateSize();
    applyFit();
  }, [applyFit, markers.length, suppressAutoFit]);

  // Refits på resize
  useEffect(() => {
    const handleResize = () => {
      if (!mapRef.current || suppressAutoFit) return;
      mapRef.current.invalidateSize();
      applyFit();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyFit, suppressAutoFit]);

  const clusteringActive = zoomLevel < CLUSTER_ZOOM_THRESHOLD;

  // Fly to active marker when it changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeMarkerId) return;
    const targetMarker = markers.find((m) => m.id === activeMarkerId);
    if (!targetMarker) return;
    if (lastFocusedMarkerId.current === activeMarkerId) return;

    const currentZoom = map.getZoom();
    const desiredZoom = Math.min(15.5, DETAIL_ZOOM_THRESHOLD + 0.5);
    const targetZoom = Math.min(
      currentZoom + 1.25,
      Math.max(currentZoom, desiredZoom),
    );

    // Mjukare rörelse mellan annonser
    map.flyTo(targetMarker.position, targetZoom, {
      duration: 0.45,
      easeLinearity: 0.22,
    });
    lastFocusedMarkerId.current = activeMarkerId;
  }, [activeMarkerId, markers]);

  useEffect(() => {
    if (!activeMarkerId) {
      lastFocusedMarkerId.current = null;
    }
  }, [activeMarkerId]);

  // Auto-open popup när man zoomat in tillräckligt nära
  useEffect(() => {
    if (!mapRef.current) return;
    if (manualPopupRef.current) return;
    if (markers.length === 0) {
      setActivePopupId(null);
      return;
    }
    if (clusteringActive) {
      setActivePopupId(null);
      return;
    }
    if (zoomLevel < DETAIL_ZOOM_THRESHOLD) {
      setActivePopupId(null);
      return;
    }

    const center = mapRef.current.getCenter();
    let closestId: string | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    markers.forEach((marker) => {
      const distance = mapRef.current!.distance(center, marker.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = marker.id;
      }
    });

    // Only open if the marker is rendered (i.e. ref exists)
    if (closestId && markerRefs.current[closestId]) {
      setActivePopupId(closestId);
    }
  }, [markers, zoomLevel, clusteringActive]);

  // Sync popup visibility with activePopupId
  useEffect(() => {
    const marker = activePopupId
      ? markerRefs.current[activePopupId]
      : null;

    if (marker) {
      marker.openPopup();
    } else {
      Object.values(markerRefs.current).forEach((m) => m.closePopup());
    }
  }, [activePopupId]);

  type Cluster = {
    point: L.Point;
    position: [number, number];
    markers: BaseMarker[];
  };

  // Grid-adjacent clustering utan extra beroenden
  const clusters = useMemo<Cluster[]>(() => {
    const map = mapRef.current;
    if (!map || !clusteringActive || markers.length === 0) return [];

    const grouped: Cluster[] = [];

    markers.forEach((marker) => {
      const projected = map.project(marker.position, zoomLevel);

      const existing = grouped.find((cluster) => {
        const dx = cluster.point.x - projected.x;
        const dy = cluster.point.y - projected.y;
        return Math.hypot(dx, dy) <= CLUSTER_RADIUS_PX;
      });

      if (existing) {
        existing.markers.push(marker);
        const count = existing.markers.length;
        existing.point = new L.Point(
          (existing.point.x * (count - 1) + projected.x) / count,
          (existing.point.y * (count - 1) + projected.y) / count,
        );
        const latLng = map.unproject(existing.point, zoomLevel);
        existing.position = [latLng.lat, latLng.lng];
        return;
      }

      grouped.push({
        markers: [marker],
        point: projected,
        position: marker.position,
      });
    });

    return grouped;
  }, [clusteringActive, markers, zoomLevel]);

  const clusterIconCache = useRef<Record<string, L.DivIcon>>({});
  const getClusterIcon = useCallback((size: number, isActive: boolean) => {
    const key = `${size}-${isActive ? "active" : "default"}`;
    if (!clusterIconCache.current[key]) {
      const bg = isActive
        ? "linear-gradient(135deg, rgba(249,115,22,0.95), rgba(234,88,12,0.95))"
        : "rgba(59,130,246,0.92)";
      clusterIconCache.current[key] = L.divIcon({
        html: `<div style="display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:9999px;background:${bg};color:#fff;font-weight:700;border:2px solid #e0ecff;box-shadow:0 6px 18px rgba(0,0,0,0.18);">${size}</div>`,
        className: "",
        iconSize: [46, 46],
      });
    }
    return clusterIconCache.current[key];
  }, []);

  const renderMarker = useCallback(
    (marker: BaseMarker) => {
      const isActive = marker.id === activeMarkerId;

      const popupContent =
        typeof marker.popup === "function"
          ? marker.popup({ zoom: zoomLevel, isActive })
          : marker.popup;

      return (
        <Fragment key={marker.id}>
          {isActive && (
            <CircleMarker
              center={marker.position}
              radius={18}
              pathOptions={{
                color: "#2563eb",
                weight: 3,
                opacity: 0.9,
                fillColor: "#60a5fa",
                fillOpacity: 0.2,
              }}
            />
          )}
          <Marker
            position={marker.position}
            zIndexOffset={isActive ? 500 : 0}
            riseOnHover
            ref={(ref) => {
              if (ref) {
                markerRefs.current[marker.id] = ref;
              } else {
                delete markerRefs.current[marker.id];
              }
            }}
            eventHandlers={{
              click: () => {
                manualPopupRef.current = true;
                setActivePopupId(marker.id);
              },
            }}
          >
            {popupContent && (
              <Popup
                className="map-popup"
                eventHandlers={{
                  remove: () => {
                    if (manualPopupRef.current && activePopupId === marker.id) {
                      manualPopupRef.current = false;
                      setActivePopupId(null);
                    }
                  },
                  add: () => {
                    // sync state när Leaflet öppnar via openPopup()
                    setActivePopupId((prev) => prev ?? marker.id);
                  },
                }}
                closeButton
                autoPan={manualPopupRef.current}
                autoPanPadding={[24, 24]}
              >
                {popupContent}
              </Popup>
            )}
          </Marker>
        </Fragment>
      );
    },
    [activeMarkerId, zoomLevel, activePopupId],
  );

  if (!isClient) {
    return (
      <div
        className={className ?? "w-full rounded-2xl"}
        style={{ minHeight: 520, width: "100%" }}
        aria-hidden
      />
    );
  }

  const shouldCluster = clusteringActive && clusters.length > 0;

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      scrollWheelZoom
      className={className ?? "w-full rounded-2xl"}
      ref={mapRef}
      style={{
        height: "min(72vh, 760px)",
        minHeight: 600,
        width: "100%",
      }}
    >
      <ZoomListener onZoomChange={setZoomLevel} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {shouldCluster
        ? clusters.map((cluster) => {
            if (cluster.markers.length === 1) {
              return renderMarker(cluster.markers[0]);
            }

            const markerIds = cluster.markers.map((m) => m.id).join("-");
            const isActiveCluster = cluster.markers.some(
              (m) => m.id === activeMarkerId,
            );
            return (
              <Marker
                key={`cluster-${markerIds}`}
                position={cluster.position}
                icon={getClusterIcon(cluster.markers.length, isActiveCluster)}
                eventHandlers={{
                  click: () => {
                    const map = mapRef.current;
                    if (!map) return;
                    const targetZoom = Math.max(
                      zoomLevel + 2,
                      CLUSTER_ZOOM_THRESHOLD + 1,
                    );
                    map.setView(cluster.position, targetZoom);
                  },
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold">
                      {cluster.markers.length} platser här
                    </div>
                    <div className="text-xs text-gray-500">
                      Zooma in för detaljerade markeringar.
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })
        : markers.map((marker) => renderMarker(marker))}
    </MapContainer>
  );
};

export default BaseMap;

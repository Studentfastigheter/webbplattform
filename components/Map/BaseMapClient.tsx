"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
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
const ACTIVE_POPUP_VERTICAL_OFFSET_PX = 150;

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
const [initialCenter] = useState<[number, number]>(() => {
  if (markers.length === 0) return center;
  if (markers.length === 1) return markers[0].position;
  // Use median as a good starting center
  const sorted = (arr: number[]) => [...arr].sort((a, b) => a - b);
  const median = (arr: number[]) => {
    const s = sorted(arr);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };
  return [
    median(markers.map((m) => m.position[0])),
    median(markers.map((m) => m.position[1])),
  ] as [number, number];
});

const [initialZoom] = useState<number>(() => {
  if (markers.length === 0) return zoom;
  if (markers.length === 1) return 13;
  return 12; // city-level starting point; applyFit refines it
});

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

    // Centrera mot det tätaste området (filtrera bort extrema outliers)
    const getMedian = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const lats = markers.map(m => m.position[0]);
    const lngs = markers.map(m => m.position[1]);
    const medianLat = getMedian(lats);
    const medianLng = getMedian(lngs);

    // Kärnområdet: Markörer som ligger inom ca 10 mil från medianen (1 grad)
    const coreMarkers = markers.filter(m => 
      Math.abs(m.position[0] - medianLat) < 0.15 && 
      Math.abs(m.position[1] - medianLng) < 0.15
    );

    // Om kärnområdet är för litet, använd alla markörer för att inte tappa information
    const markersToFit =
      coreMarkers.length >= Math.min(3, markers.length * 0.3)
        ? coreMarkers
        : markers;  
    const bounds = L.latLngBounds(markersToFit.map((m) => m.position));
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
  }, [applyFit, suppressAutoFit]);

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

  const clusteringActive = zoomLevel < CLUSTER_ZOOM_THRESHOLD && !hasActiveMarker;

  // Fly to active marker when it changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeMarkerId) return;
    const targetMarker = markers.find((m) => m.id === activeMarkerId);
    if (!targetMarker) return;
    manualPopupRef.current = false;
    setActivePopupId(activeMarkerId);
    if (lastFocusedMarkerId.current === activeMarkerId) return;

    const currentZoom = map.getZoom();
    const desiredZoom = Math.min(15.5, DETAIL_ZOOM_THRESHOLD + 0.5);
    const targetZoom = Math.min(
      currentZoom + 1.25,
      Math.max(currentZoom, desiredZoom),
    );

    // Mjukare rörelse mellan annonser
    const targetPoint = map.project(targetMarker.position, targetZoom);
    const offsetCenterPoint = targetPoint.subtract([
      0,
      ACTIVE_POPUP_VERTICAL_OFFSET_PX,
    ]);
    const offsetCenter = map.unproject(offsetCenterPoint, targetZoom);

    map.flyTo(offsetCenter, targetZoom, {
      duration: 0.45,
      easeLinearity: 0.22,
    });
    lastFocusedMarkerId.current = activeMarkerId;
  }, [activeMarkerId, markers]);

  useEffect(() => {
    if (!activeMarkerId) {
      lastFocusedMarkerId.current = null;
      if (!manualPopupRef.current) {
        setActivePopupId(null);
      }
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
    if (activeMarkerId && markers.some((marker) => marker.id === activeMarkerId)) {
      setActivePopupId(activeMarkerId);
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
  }, [markers, zoomLevel, clusteringActive, activeMarkerId]);

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
      clusterIconCache.current[key] = L.divIcon({
        html: `<div class="map-cluster-marker ${isActive ? "is-active" : ""}">${size}</div>`,
        className: "map-cluster-icon",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
    }
    return clusterIconCache.current[key];
  }, []);

  const markerIconCache = useRef<Record<string, L.DivIcon>>({});
  const getMarkerIcon = useCallback((isActive: boolean) => {
    const key = isActive ? "active" : "default";
    if (!markerIconCache.current[key]) {
      markerIconCache.current[key] = L.divIcon({
        html: `<div class="map-listing-marker ${isActive ? "is-active" : ""}"><span></span></div>`,
        className: "map-listing-icon",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -14],
      });
    }
    return markerIconCache.current[key];
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
          <Marker
            position={marker.position}
            icon={getMarkerIcon(isActive)}
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
                minWidth={260}
                maxWidth={360}
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
                closeButton={false}
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
    [activeMarkerId, zoomLevel, activePopupId, getMarkerIcon],
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

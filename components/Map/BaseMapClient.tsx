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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  imageOverlayContent?: ReactNode;
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
  autoFitMarkers?: boolean;
  fillContainer?: boolean;
};

const CLUSTER_ZOOM_THRESHOLD = 10;
const DETAIL_ZOOM_THRESHOLD = 14;
const MARKER_ICON_SIZE_PX = 22;
const MARKER_TOUCH_CLUSTER_RADIUS_PX = MARKER_ICON_SIZE_PX;
const ACTIVE_POPUP_VERTICAL_OFFSET_PX = 150;
const SAME_POSITION_EPSILON = 0.0000001;

// ========= HJÄLPKOMPONENTER =========

const ZoomListener: React.FC<{
  onMapReady: (map: L.Map) => void;
  onZoomChange: (zoom: number) => void;
}> = ({ onMapReady, onZoomChange }) => {
  const map = useMapEvents({
    zoomend: (event) => {
      onZoomChange(event.target.getZoom());
    },
  });

  useEffect(() => {
    onMapReady(map);

    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
      onMapReady(map);
      onZoomChange(map.getZoom());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [map, onMapReady, onZoomChange]);

  return null;
};

const getPopupContent = (
  marker: BaseMarker,
  zoom: number,
  isActive: boolean,
  imageOverlayContent?: ReactNode,
) =>
  typeof marker.popup === "function"
    ? marker.popup({ zoom, isActive, imageOverlayContent })
    : marker.popup;

const hasSamePosition = (a: BaseMarker, b: BaseMarker) =>
  Math.abs(a.position[0] - b.position[0]) <= SAME_POSITION_EPSILON &&
  Math.abs(a.position[1] - b.position[1]) <= SAME_POSITION_EPSILON;

const ClusterPreviewPopup: React.FC<{
  markers: BaseMarker[];
  zoom: number;
  activeMarkerId?: string;
}> = ({ markers, zoom, activeMarkerId }) => {
  const [index, setIndex] = useState(0);
  const markerIds = markers.map((marker) => marker.id).join("-");

  useEffect(() => {
    setIndex(0);
  }, [markerIds]);

  const activeIndex = Math.min(index, markers.length - 1);
  const marker = markers[activeIndex];
  const goToPrevious = () => {
    setIndex((current) =>
      current <= 0 ? markers.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setIndex((current) =>
      current >= markers.length - 1 ? 0 : current + 1,
    );
  };

  const imageOverlayContent =
    markers.length > 1 ? (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        <button
          type="button"
          aria-label="Föregående annons"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            goToPrevious();
          }}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#004225] shadow-sm backdrop-blur-sm transition hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
          {activeIndex + 1} / {markers.length}
        </div>

        <button
          type="button"
          aria-label="Nästa annons"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            goToNext();
          }}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#004225] shadow-sm backdrop-blur-sm transition hover:bg-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    ) : undefined;

  const popupContent = marker
    ? getPopupContent(
        marker,
        zoom,
        marker.id === activeMarkerId,
        imageOverlayContent,
      )
    : null;

  return (
    <div className="w-[320px] max-w-[calc(100vw-48px)]">
      {markers.length > 1 && (
        <div className="hidden">
          <button
            type="button"
            aria-label="Föregående annons"
            onClick={(event) => {
              event.stopPropagation();
              goToPrevious();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#004225] transition hover:bg-[#004225]/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-0 text-center text-xs font-semibold text-black/70">
            {activeIndex + 1} av {markers.length}
          </span>
          <button
            type="button"
            aria-label="Nästa annons"
            onClick={(event) => {
              event.stopPropagation();
              goToNext();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#004225] transition hover:bg-[#004225]/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {popupContent}
    </div>
  );
};

// ========= HUVUDKARTA =========

const BaseMap: React.FC<BaseMapProps> = ({
  center = [59, 15], // mitten-ish av Sverige
  zoom = 5,
  markers = [],
  className,
  activeMarkerId,
  autoFitMarkers = true,
  fillContainer = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(zoom);
  const [activePopupId, setActivePopupId] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const lastFocusedMarkerId = useRef<string | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const manualPopupRef = useRef(false);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    setMapInstance((current) => (current === map ? current : map));
    setZoomLevel(map.getZoom());
  }, []);

  const focusMarker = useCallback((marker: BaseMarker, forceZoom = false) => {
    const map = mapRef.current;
    if (!map) return;

    const currentZoom = map.getZoom();
    const desiredZoom = Math.min(15.5, DETAIL_ZOOM_THRESHOLD + 0.5);
    const targetZoom = forceZoom
      ? Math.max(currentZoom, desiredZoom)
      : Math.min(
          currentZoom + 1.25,
          Math.max(currentZoom, desiredZoom),
        );

    const targetPoint = map.project(marker.position, targetZoom);
    const offsetCenterPoint = targetPoint.subtract([
      0,
      ACTIVE_POPUP_VERTICAL_OFFSET_PX,
    ]);
    const offsetCenter = map.unproject(offsetCenterPoint, targetZoom);

    map.flyTo(offsetCenter, targetZoom, {
      duration: 0.45,
      easeLinearity: 0.22,
    });
  }, []);

  // Frys initial center/zoom så de inte hoppar om props ändras
  const [initialCenter] = useState<[number, number]>(() => {
    if (!autoFitMarkers) return center;
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
    if (!autoFitMarkers) return zoom;
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
    if (!autoFitMarkers || !mapRef.current || suppressAutoFit) return;
    mapRef.current.invalidateSize();
    applyFit();
  }, [applyFit, autoFitMarkers, suppressAutoFit, mapInstance]);

  // Refits på resize
  useEffect(() => {
    const handleResize = () => {
      if (!autoFitMarkers || !mapRef.current || suppressAutoFit) return;
      mapRef.current.invalidateSize();
      applyFit();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyFit, autoFitMarkers, suppressAutoFit]);

  const clusteringActive = markers.length > 1;

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
  }, [activeMarkerId, markers, mapInstance]);

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
  }, [markers, zoomLevel, activeMarkerId]);

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
    points: L.Point[];
    position: [number, number];
    markers: BaseMarker[];
  };

  // Grid-adjacent clustering utan extra beroenden
  const clusters = useMemo<Cluster[]>(() => {
    const map = mapInstance;
    if (!map || !clusteringActive || markers.length === 0) return [];

    const grouped: Cluster[] = [];

    markers.forEach((marker) => {
      const projected = map.project(marker.position, zoomLevel);

      const touchingClusters = grouped.filter((cluster) =>
        cluster.points.some((point) => {
          const dx = point.x - projected.x;
          const dy = point.y - projected.y;
          return Math.hypot(dx, dy) <= MARKER_TOUCH_CLUSTER_RADIUS_PX;
        }),
      );

      if (touchingClusters.length > 0) {
        const [target, ...clustersToMerge] = touchingClusters;
        target.markers.push(marker);
        target.points.push(projected);

        clustersToMerge.forEach((cluster) => {
          target.markers.push(...cluster.markers);
          target.points.push(...cluster.points);
          grouped.splice(grouped.indexOf(cluster), 1);
        });

        target.point = new L.Point(
          target.points.reduce((sum, point) => sum + point.x, 0) / target.points.length,
          target.points.reduce((sum, point) => sum + point.y, 0) / target.points.length,
        );
        const latLng = map.unproject(target.point, zoomLevel);
        target.position = [latLng.lat, latLng.lng];
        return;
      }

      grouped.push({
        markers: [marker],
        point: projected,
        points: [projected],
        position: marker.position,
      });
    });

    return grouped;
  }, [clusteringActive, markers, zoomLevel, mapInstance]);

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

      const popupContent = getPopupContent(marker, zoomLevel, isActive);

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
                focusMarker(marker, true);
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
    [activeMarkerId, zoomLevel, activePopupId, focusMarker, getMarkerIcon],
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
        height: fillContainer ? "100%" : "min(72vh, 760px)",
        minHeight: fillContainer ? 0 : 600,
        width: "100%",
      }}
    >
      <ZoomListener onMapReady={handleMapReady} onZoomChange={setZoomLevel} />
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
            const isStackedCluster = cluster.markers.every((marker) =>
              hasSamePosition(marker, cluster.markers[0]),
            );
            return (
              <Marker
                key={`cluster-${markerIds}`}
                position={cluster.position}
                icon={getClusterIcon(cluster.markers.length, isActiveCluster)}
                eventHandlers={{
                  click: () => {
                    if (isStackedCluster) {
                      manualPopupRef.current = true;
                      return;
                    }

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
                <Popup
                  className={isStackedCluster ? "map-popup" : undefined}
                  minWidth={isStackedCluster ? 260 : undefined}
                  maxWidth={isStackedCluster ? 360 : undefined}
                  closeButton={!isStackedCluster}
                  autoPan={isStackedCluster}
                  autoPanPadding={[24, 24]}
                >
                  {isStackedCluster ? (
                    <ClusterPreviewPopup
                      markers={cluster.markers}
                      zoom={zoomLevel}
                      activeMarkerId={activeMarkerId}
                    />
                  ) : (
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold">
                      {cluster.markers.length} platser här
                    </div>
                    <div className="text-xs text-gray-500">
                      Zooma in för detaljerade markeringar.
                    </div>
                  </div>
                  )}
                </Popup>
              </Marker>
            );
          })
        : markers.map((marker) => renderMarker(marker))}
    </MapContainer>
  );
};

export default BaseMap;

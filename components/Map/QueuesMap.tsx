"use client";

import { useMemo } from "react";
import BaseMap, {
  type BaseMarker,
  type PopupRenderer,
} from "./BaseMap";
import {
  type AdvertiserSummary,
  type Coordinates,
  type HousingQueue,
  type QueueId,
  type UrlString,
} from "@/types";
import QueueMapPopup from "./QueueMapPopup";

type QueueWithCoordinates = HousingQueue & {
  advertiser: AdvertiserSummary;
  lat: NonNullable<Coordinates["lat"]>;
  lng: NonNullable<Coordinates["lng"]>;
  logoUrl?: UrlString | null;
  unitsLabel?: string | null;
  isVerified?: boolean;
};

type QueuesMapProps = {
  queues: QueueWithCoordinates[];
  className?: string;
  activeQueueId?: QueueId;
  onOpenQueue?: (id: QueueId) => void;
};

/**
 * Wrapper runt QueueMapPopup så den matchar BaseMaps PopupRenderer-signatur.
 * Vi ignorerar zoom/isActive här för att alltid visa samma kortdesign.
 */
const createQueuePopupRenderer =
  (queue: QueueWithCoordinates, onOpenQueue?: (id: QueueId) => void): PopupRenderer =>
  () => {
    const popupData = {
      queueId: queue.queueId,
      name: queue.name,
      city: queue.city ?? "",
      area: queue.area ?? "",
      advertiser: queue.advertiser,
      logoUrl: queue.logoUrl,
      totalUnits: queue.totalUnits,
      unitsLabel: queue.unitsLabel,
      isVerified: queue.isVerified ?? false,
      status: queue.status,
      tags: queue.tags,
      lat: queue.lat,
      lng: queue.lng,
    };

    return <QueueMapPopup queue={popupData} onOpen={onOpenQueue} />;
  };

// ---- Huvudkomponent ----

const QueuesMap: React.FC<QueuesMapProps> = ({
  queues,
  className,
  activeQueueId,
  onOpenQueue,
}) => {
  // Bygg markers från de *filtrerade* köerna
  const markers = useMemo<BaseMarker[]>(() => {
    return queues.map((queue) => ({
      id: queue.queueId,
      position: [queue.lat, queue.lng] as [number, number],
      popup: createQueuePopupRenderer(queue, onOpenQueue),
    }));
  }, [queues, onOpenQueue]);

  return (
    <BaseMap
      markers={markers}
      className={className}
      // center & zoom är bara initial, BaseMap auto-fittar till markers
      center={[59, 15]}
      zoom={5}
      activeMarkerId={activeQueueId}
    />
  );
};

export default QueuesMap;

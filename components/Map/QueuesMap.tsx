"use client";

import { useMemo } from "react";
import BaseMap, {
  type BaseMarker,
  type PopupRenderer,
} from "./BaseMap";

import QueueMapPopup, { type QueuePopupData } from "./QueueMapPopup";

export type QueueItem = {
  id: string;
  name: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  totalUnits?: number;
  unitsLabel?: string;
  isVerified?: boolean;
  landlord: string;
  status?: "open" | "queue";
  logoUrl: string;
  tags?: string[];
};

type QueuesMapProps = {
  queues: QueueItem[];
  className?: string;
  activeQueueId?: string;
  onOpenQueue?: (id: string) => void;
};

/**
 * Wrapper runt QueueMapPopup så den matchar BaseMaps PopupRenderer-signatur.
 * Vi ignorerar zoom/isActive här för att alltid visa samma kortdesign.
 */
const createQueuePopupRenderer =
  (queue: QueueItem, onOpenQueue?: (id: string) => void): PopupRenderer =>
  () => {
    const popupData: QueuePopupData = {
      id: queue.id,
      name: queue.name,
      city: queue.city,
      area: queue.area,
      landlord: queue.landlord,
      logoUrl: queue.logoUrl,
      totalUnits: queue.totalUnits,
      unitsLabel: queue.unitsLabel,
      isVerified: queue.isVerified,
      status: queue.status,
      tags: queue.tags,
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
      id: queue.id,
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

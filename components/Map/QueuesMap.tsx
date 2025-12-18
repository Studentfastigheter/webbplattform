"use client";

import { useMemo } from "react";
import BaseMap, { type BaseMarker, type PopupRenderer } from "./BaseMap";
import {
  type HousingQueue,
  type QueueId,
} from "@/types";
import QueueMapPopup from "./QueueMapPopup";

// Vi definierar en typ som tvingar lat/lng att existera för kartan
// även om de är valfria i grundtypen HousingQueue
type QueueWithCoordinates = HousingQueue & {
  lat: number;
  lng: number;
};

type QueuesMapProps = {
  queues: QueueWithCoordinates[];
  className?: string;
  activeQueueId?: QueueId;
  onOpenQueue?: (id: QueueId) => void;
};

/**
 * Wrapper runt QueueMapPopup så den matchar BaseMaps PopupRenderer-signatur.
 */
const createQueuePopupRenderer =
  (queue: QueueWithCoordinates, onOpenQueue?: (id: QueueId) => void): PopupRenderer =>
  () => {
    // Vi skickar hela queue-objektet eftersom QueueMapPopup nu hanterar HousingQueue-typen
    return <QueueMapPopup queue={queue} onOpen={onOpenQueue} />;
  };

// ---- Huvudkomponent ----

const QueuesMap: React.FC<QueuesMapProps> = ({
  queues,
  className,
  activeQueueId,
  onOpenQueue,
}) => {
  // Bygg markers från de filtrerade köerna
  const markers = useMemo<BaseMarker[]>(() => {
    return queues.map((queue) => ({
      id: queue.id, // Uppdaterat från queueId till id
      position: [queue.lat, queue.lng] as [number, number],
      popup: createQueuePopupRenderer(queue, onOpenQueue),
    }));
  }, [queues, onOpenQueue]);

  return (
    <BaseMap
      markers={markers}
      className={className}
      // center & zoom är bara initial, BaseMap auto-fittar till markers om de finns
      center={[59, 15]}
      zoom={5}
      activeMarkerId={activeQueueId}
    />
  );
};

export default QueuesMap;
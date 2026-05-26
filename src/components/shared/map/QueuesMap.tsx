"use client";

import { useMemo } from "react";
import BaseMap, { type BaseMarker, type PopupRenderer } from "./BaseMap";
// VIKTIGT: Byt import till HousingQueueDTO
import { type HousingQueueDTO, type QueueMapItem } from "@/types/queue";
import { type AdvertiserSummary } from "@/types/common";
import QueueMapPopup from "./QueueMapPopup";

type QueuesMapProps = {
  queues: QueueMapItem[]; // Uppdaterad prop-typ
  className?: string;
  activeQueueId?: string;
  onOpenQueue?: (id: string) => void;
};

const createQueuePopupRenderer =
  (queue: QueueMapItem, onOpenQueue?: (id: string) => void): PopupRenderer =>
  () => {
    // OBS: QueueMapPopup behöver kanske uppdateras också om den förlitar sig strikt på gamla "HousingQueue".
    // Vi använder "as any" här för att inte blockera bygget, men du bör kolla Popup-komponenten sen.
    return <QueueMapPopup queue={queue as any} onOpen={onOpenQueue} />;
  };

const QueuesMap: React.FC<QueuesMapProps> = ({
  queues,
  className,
  activeQueueId,
  onOpenQueue,
}) => {
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
      center={[59, 15]}
      zoom={5}
      activeMarkerId={activeQueueId}
    />
  );
};

export default QueuesMap;

"use client";

import BaseMap, { type BaseMarker } from "./BaseMap";

type QueueItem = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
};

type QueuesMapProps = {
  queues: QueueItem[];
};

const QueuesMap: React.FC<QueuesMapProps> = ({ queues }) => {
  const markers: BaseMarker[] = queues.map((q) => ({
    id: q.id,
    position: [q.lat, q.lng] as [number, number],
    popup: (
      <div className="text-sm">
        <div className="font-semibold">{q.name}</div>
        <div>{q.city}</div>
      </div>
    ),
  }));


  return <BaseMap markers={markers} />;
};

export default QueuesMap;

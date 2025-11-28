"use client";

import BaseMap, { type BaseMarker } from "./BaseMap";

type ListingItem = {
  id: string;
  title: string;
  address?: string;
  city: string;
  lat: number;
  lng: number;
  rent?: number;
};

type ListingsMapProps = {
  listings: ListingItem[];
};

const ListingsMap: React.FC<ListingsMapProps> = ({ listings }) => {
  const markers: BaseMarker[] = listings.map((l) => ({
    id: l.id,
    position: [l.lat, l.lng],
    popup: (
      <div className="text-sm space-y-1">
        <div className="font-semibold">{l.title}</div>
        <div>{l.city}</div>
        {l.address && <div className="text-xs text-gray-500">{l.address}</div>}
        {typeof l.rent === "number" && (
          <div className="text-xs font-medium">
            {new Intl.NumberFormat("sv-SE", {
              maximumFractionDigits: 0,
            }).format(l.rent)}{" "}
            kr/mån
          </div>
        )}
      </div>
    ),
  }));

  return <BaseMap markers={markers} zoom={6} />;
};

export default ListingsMap;

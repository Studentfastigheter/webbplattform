"use client";

import { useMemo } from "react";
import BaseMap, {
  type BaseMarker,
  type PopupRenderer,
} from "@/components/Map/BaseMap";
import ListingMapPopup from "@/components/Map/ListingsMapPopup";
import { MapPin, Pin } from "lucide-react";

type ListingsMapProps = {
  className?: string;
};

const ListingsMap: React.FC<ListingsMapProps> = ({
  className,
}) => {

  return (
    <div className="max-w-2xl mx-auto mt-12 relative">

        <BaseMap
          markers={[]}
          zoom={18}
          center={[57.6978339,11.9551305]}
          className={className}
          activeMarkerId={""}
        />

        <MapPin 
          fill="#202020"
          className="opacity-90 h-16 w-16 z-1000 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[70%]" 
        />

    </div>
  );
};

export default ListingsMap;

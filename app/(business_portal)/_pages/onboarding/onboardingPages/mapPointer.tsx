"use client";

import { useMemo } from "react";
import BaseMap, {
  type BaseMarker,
  type PopupRenderer,
} from "@/components/Map/BaseMap";
import ListingMapPopup from "@/components/Map/ListingsMapPopup";

type ListingsMapProps = {
  className?: string;
};

const ListingsMap: React.FC<ListingsMapProps> = ({
  className,
}) => {

  return (
    <div className="max-w-2xl mx-auto mt-12">

        <BaseMap
          markers={[]}
          zoom={18}
          center={[57.6978339,11.9551305]}
          className={className}
          activeMarkerId={""}
        />

    </div>
  );
};

export default ListingsMap;

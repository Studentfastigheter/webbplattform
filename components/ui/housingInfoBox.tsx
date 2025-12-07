"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Heart, Share2 } from "lucide-react";

type HousingInfoBoxProps = {
  rent?: number | null;           // 3800
  moveInDate?: string | null;     // "2026-07-03"
  lastApplyDate?: string | null;  // "2026-05-24"

  width?: number | string;
  height?: number | string;
  className?: string;

  onApplyClick?: () => void;
};

export default function HousingInfoBox({
  rent,
  moveInDate,
  lastApplyDate,
  width,
  height,
  className = "",
  onApplyClick,
}: HousingInfoBoxProps) {
  const formattedRent =
    typeof rent === "number"
      ? `${rent.toLocaleString("sv-SE")} kr/månad`
      : "Hyra ej angiven";
  const formattedMoveIn = moveInDate ?? "Inte angivet";
  const formattedApplyBy = lastApplyDate ?? "Inte angivet";

  return (
    <div
      className={`
        inline-flex flex-col
        rounded-[40px]
        bg-white
        border border-black/5
        shadow-[0_3px_4px_rgba(0,0,0,0.25)]
        overflow-hidden
        ${className}
      `}
      style={{ width: width ?? 280, height }}
    >
      {/* Rad 1: Hyra + ikoner */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <span className="text-[21px] leading-[24px] font-semibold text-gray-900">
          {formattedRent}
        </span>

        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5" />
          <Share2 className="w-5 h-5" />
        </div>
      </div>

      {/* Rad 2: Inflyttningsdatum */}
      <div className="px-5 py-1">
        <span className="text-[12px] leading-[14px] text-[#666666]">
          Inflyttningsdatum: {formattedMoveIn}
        </span>
      </div>

      {/* Rad 3: Sista anmälningsdag */}
      <div className="px-5 pb-2 pt-1">
        <span className="text-[12px] leading-[14px] text-[#666666]">
          Sista anmälningsdag: {formattedApplyBy}
        </span>
      </div>

      {/* Rad 4: Knapp */}
      <div className="px-5 pb-4 pt-1">
        <Button
          onClick={onApplyClick}
          className={`
            w-full h-[31px]
            rounded-full
            bg-[#004323] text-white
            text-[14px] leading-[16px]
            normal-case
            shadow-[0_3px_4px_rgba(0,0,0,0.25)]
          `}
        >
          Intresseanmälan
        </Button>
      </div>
    </div>
  );
}

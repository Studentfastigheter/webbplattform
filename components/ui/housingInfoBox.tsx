import { Button } from "@radix-ui/themes";
import { Heart, Share2, Home, MapPin, Building2 } from "lucide-react";

import React from "react";

type HousingInfoBoxProps = {
  rentText: number;
  moveInDate: string;
  lastApplyDate: string;


  width?: number | string;
  height?: number | string;

  className?: string;
  style?: React.CSSProperties;

  // layer styling
  rentClassName?: string;
  rentStyle?: React.CSSProperties;

  moveInClassName?: string;
  moveInStyle?: React.CSSProperties;

  lastApplyClassName?: string;
  lastApplyStyle?: React.CSSProperties;

  // button layer
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
  buttonText?: string;
  buttonTextClassName?: string;
  onButtonClick?: () => void;

  // text styling
  rentTextClassName?: string;
  moveInTextClassName?: string;
  lastApplyTextClassName?: string;
};

export default function HousingInfoBox({
  rentText,
  moveInDate,
  lastApplyDate,

  width,
  height,

  className = "",
  style,

  rentClassName = "",
  rentStyle,

  moveInClassName = "",
  moveInStyle,

  lastApplyClassName = "",
  lastApplyStyle,

  buttonClassName = "",
  buttonStyle,
  buttonText = "Intresseanmälan",
  buttonTextClassName = "",
  onButtonClick,

  rentTextClassName = "",
  moveInTextClassName = "",
  lastApplyTextClassName = "",
}: HousingInfoBoxProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden ${className}`}
      style={{ width, height, ...style }}
    >
      {/* Layer 1 */}
    <div className={`flex-1 flex items-center justify-between ${rentClassName}`} style={rentStyle}>
    
    {/* Hyra-text */}
    <span className={rentTextClassName}>
    {rentText.toLocaleString("sv-SE")} kr/månad
    </span>

    {/* Ikoner */}
    <div className="flex items-center gap-4 pr-2">
        <Heart size={24} />
        <Share2 size={24} />
    </div>
    </div>

      
      {/* Layer 2 */}
      <div className={`flex-1 flex items-center ${moveInClassName}`} style={moveInStyle}>
        <span className={moveInTextClassName}>
          Inflyttningsdatum: {moveInDate}
        </span>
      </div>

      {/* Layer 3 */}
      <div className={`flex-1 flex items-center ${lastApplyClassName}`} style={lastApplyStyle}>
        <span className={lastApplyTextClassName}>
          Sista anmälningsdag: {lastApplyDate}
        </span>
      </div>

      {/* Layer 4: Button */}
      <div
        className={`flex justify-center items-center ${buttonClassName}`}
        style={buttonStyle}
        >
        <button
            onClick={onButtonClick}
            className={`bg-[#004323] text-white rounded-full px-18 py-2 ${buttonTextClassName}`}
        >
            {buttonText}
        </button>
      </div>

    

    </div>
  );
}

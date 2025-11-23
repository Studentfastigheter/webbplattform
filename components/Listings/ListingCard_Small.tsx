import React, { useEffect, useRef, useState } from "react";
import Tag from "../ui/Tag";
import VerifiedTag from "../ui/VerifiedTag";

export type ListingCardSmallProps = {
  title: string;
  area: string;
  city: string;
  dwellingType: string;
  rooms: number;
  sizeM2: number;
  rent: number;
  landlordType: string;
  isVerified?: boolean;
  imageUrl: string;
  tags?: string[];
  onClick?: () => void;
};

const BASE_WIDTH = 480;
const MIN_SCALE = 0.75;
const MAX_SCALE = 1.3;

const ListingCard_Small: React.FC<ListingCardSmallProps> = ({
  title,
  area,
  city,
  dwellingType,
  rooms,
  sizeM2,
  rent,
  landlordType,
  isVerified = false,
  imageUrl,
  tags = [],
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const updateScale = (width: number) => {
      const nextScale = Math.min(
        Math.max(width / BASE_WIDTH, MIN_SCALE),
        MAX_SCALE
      );
      setScale(Number(nextScale.toFixed(3)));
    };

    updateScale(node.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        updateScale(entry.contentRect.width);
      });
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const scaleValue = (value: number) => `${(value * scale).toFixed(2)}px`;
  const tagSize = {
    height: 26 * scale,
    horizontalPadding: 14 * scale,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className="flex w-full max-w-[480px] flex-col bg-white shadow-md cursor-pointer"
      style={{
        gap: scaleValue(16),
        padding: scaleValue(16),
        borderRadius: scaleValue(32),
      }}
    >
      {/* IMAGE */}
      <div
        className="relative w-full overflow-hidden"
        style={{ borderRadius: scaleValue(28) }}
      >
        <div className="aspect-[4/3] w-full">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div
        className="px-1 pb-1"
        style={{
          display: "grid",
          rowGap: scaleValue(12),
        }}
      >
        {/* Title + Badge */}
        <div
          className="flex items-start justify-between"
          style={{ gap: scaleValue(16) }}
        >
          <h3
            className="font-bold"
            style={{
              fontSize: scaleValue(18),
              lineHeight: scaleValue(22),
              minHeight: scaleValue(44), // reserve two lines to keep cards aligned
            }}
          >
            {title}
          </h3>

          {isVerified && <VerifiedTag />}
        </div>

        {/* Location + Size */}
        <div
          className="flex items-start justify-between"
          style={{ gap: scaleValue(16), fontSize: scaleValue(14) }}
        >
          <div
            className="text-black"
            style={{
              display: "grid",
              rowGap: scaleValue(4),
              minHeight: scaleValue(44),
            }}
          >
            <p>
              {area}, {city}
            </p>
            <p>
              {dwellingType} {"\u00b7"} {rooms} rum {"\u00b7"} {sizeM2} m{"\u00b2"}
            </p>
          </div>

          <div className="text-right text-black">
            <p
              className="font-semibold"
              style={{ fontSize: scaleValue(18), lineHeight: scaleValue(22) }}
            >
              {rent.toLocaleString("sv-SE")} kr/m{"\u00e5"}nad
            </p>
            <p
              className="text-[#6b6b6b]"
              style={{ fontSize: scaleValue(14), lineHeight: scaleValue(18) }}
            >
              {landlordType}
            </p>
          </div>
        </div>
        
        {tags.length > 0 && (
          <div
            className="flex flex-wrap pt-0"
            style={{
              gap: scaleValue(8),
              minHeight: scaleValue(30),
            }}
          >
            {tags.map((tag) => (
              <Tag
                key={tag}
                text={tag}
                bgColor="#F0F0F0"
                textColor="black"
                height={tagSize.height}
                horizontalPadding={tagSize.horizontalPadding}
                fontSize={tagSize.fontSize}
                lineHeight={tagSize.lineHeight}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard_Small;

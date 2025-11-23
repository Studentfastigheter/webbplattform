import React from "react";
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
  return (
    <div
      onClick={onClick}
      className="flex w-full max-w-[480px] flex-col gap-4 rounded-[32px] bg-white p-4 shadow-md cursor-pointer"
    >
      {/* IMAGE */}
      <div className="relative w-full overflow-hidden rounded-[28px]">
        <div className="aspect-[4/3] w-full">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-3 px-1 pb-1">
        {/* Title + Badge */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[18px] font-bold">{title}</h3>

          {isVerified && (
            <VerifiedTag />
          )}
        </div>

        {/* Location + Size */}
        <div className="flex items-start justify-between gap-4 text-sm">
          <div className="space-y-1 text-black">
            <p>
              {area}, {city}
            </p>
            <p>
              {dwellingType} · {rooms} rum · {sizeM2} m²
            </p>
          </div>

          <div className="text-right text-black">
            <p className="text-[18px] font-semibold">
              {rent.toLocaleString("sv-SE")} kr/månad
            </p>
            <p className="text-sm text-[#6b6b6b]">{landlordType}</p>
          </div>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-0">
            {tags.map((tag) => (
              <Tag 
              key={tag} 
              text={tag}
              bgColor="#F0F0F0"
              textColor="black"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard_Small;

{/* Usage Example: 

  <ListingCard_Small
  title="1:a Vasagatan 19"
  area="Innerstan"
  city="Göteborg"
  dwellingType="Lägenhet"
  rooms={3}
  sizeM2={42}
  rent={3800}
  landlordType="Privat värd"
  isVerified={false}
  imageUrl="/appartment.jpg"
  tags={["Möblerat", "Poängfri", "Diskmaskin"]}
  onClick={() => alert("Klick!")}
/>

*/}
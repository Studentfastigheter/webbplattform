"use client";

import HousingInfoBox from "@/components/ui/housingInfoBox";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import Tag from "@/components/ui/Tag";
import type { ListingDetail } from "@/components/ads/types";
import { Home, MapPin, Pencil } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-800">
      <span className="text-green-900">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

type Props = {
  listing: ListingDetail;
  isEditable?: boolean;
};

export default function BostadAbout({ 
  listing, 
  isEditable=false 
}: Props) {


  const [editing, setEditing] = React.useState<string | null>(null);
  
  const [titleValue, setTitleValue] = React.useState<string>(listing.title);

  return (
    
    <section className="grid gap-8 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)] lg:grid-cols-[1.75fr_0.95fr]">
      {/* Vänsterkolumn */}
      
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
          Om annonsen
        </p>

        <div className="flex flex-col gap-1 items-baseline">
          {
            editing !== "title" ? (
              <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl relative">
                {listing.title}
                {isEditable && (
                      <div 
                        onClick={() => setEditing("title")}
                        className="cursor-pointer hover:bg-neutral-100/30 rounded-full p-2 absolute -right-16 top-1/2 -translate-y-1/2"
                      >
                        <Tooltip disableHoverableContent>
                          <TooltipTrigger asChild>
                            <Pencil className="text-neutral-800 w-6 h-6" />
                          </TooltipTrigger>
                          <TooltipContent className="pointer-events-none">
                            <p>Redigera</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
              </h1>
            ): (
              <div className="flex items-center gap-2">
                <Input 
                  type="text"
                  className="flex-none w-auto inline-block p-0 border-none outline-0 focus-visible:ring-0 shadow-none m-0 text-2xl! font-semibold text-gray-900 sm:text-3xl!"
                  value={titleValue} 
                  size={Math.max(titleValue.length, 1)}
                  onChange={(e) => setTitleValue(e.target.value)} 
                />
                <Button>Spara</Button>
              </div>
            )

          }
          

          {/* Två rader med ikon + text, ingen chip-bakgrund */}
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label={`${listing.area}, ${listing.city}`}
          />
          <InfoRow
            icon={<Home className="h-4 w-4" />}
            label={`${listing.dwellingType} / ${listing.rooms} / ${listing.size}`}
          />
        </div>

        {/* Taggar som chips under raderna */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {listing.tags.map((tag) => (
            <Tag
              key={tag}
              text={tag}
              bgColor="#E9E9E9"
              textColor="#111111"
              height={28}
              horizontalPadding={14}
              fontSize={13}
            />
          ))}
        </div>

        <ReadMoreComponent
          text={listing.description}
          variant="large"
          className="mt-2"
          textClassName="text-base leading-relaxed text-gray-800"
          buttonWrapClassName="pb-4"
          moreLabel="Läs mer"
          lessLabel="Visa mindre"
          scrollOffset={400}
        />
      </div>

      {/* Högerkolumn: prisbox */}
      <div className="lg:justify-self-end">
        <HousingInfoBox
          rent={listing.rent}
          moveInDate={listing.moveIn}
          lastApplyDate={listing.applyBy}
          className="w-full max-w-[280px]"
        />
      </div>
    </section>
  );
}

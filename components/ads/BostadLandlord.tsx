import Image from "next/image";
import Tag from "@/components/ui/Tag";
import type { AdvertiserSummary } from "@/types";
import { Star, Building2, User } from "lucide-react";

type Props = {
  advertiser: AdvertiserSummary & {
    highlights?: string[];
    reviewCount?: number;
    requirements?: string[];
    totalApartments?: number;
  };
};

export default function BostadLandlord({ advertiser }: Props) {
  const isCompany = advertiser.type === "company";
  
  return (
    <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50 shadow-sm">
            {advertiser.logoUrl ? (
              <Image
                src={advertiser.logoUrl}
                alt={advertiser.displayName}
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            ) : isCompany ? (
              <Building2 className="h-6 w-6 text-gray-400" />
            ) : (
              <User className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
              Din hyresvard
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              {advertiser.displayName}
            </h2>
            {advertiser.subtitle && (
              <p className="text-sm text-gray-700">{advertiser.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Tag
                text="Verifierad hyresvard"
                bgColor="#0F4D0F"
                textColor="#FFFFFF"
                height={20}
                horizontalPadding={10}
                fontSize={11}
              />
              {advertiser.rating && (
                <span className="flex items-center gap-1 text-sm text-amber-700">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>
                    {advertiser.rating.toFixed(1)} (
                    {advertiser.reviewCount ?? 0} omdomen)
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row gap-6 lg:gap-12 text-sm text-gray-800">
        
        {/* Left: Description & Total Apartments */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col mb-2">
            <h3 className="font-semibold text-gray-900 text-base mb-1">Beskrivning av värden</h3>
            <p className="text-gray-700 leading-relaxed italic">
              {advertiser.description || "Vi erbjuder moderna och trygga studentbostäder nära campus. Vårt mål är att göra studentlivet enklare för dig."}
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-green-50/50 p-3 py-2.5 rounded-xl border border-green-100/50 w-fit">
            <Building2 className="w-5 h-5 text-green-700" />
            <span className="font-medium text-green-900">
              {advertiser.totalApartments ?? 145} studentbostäder i beståndet
            </span>
          </div>
        </div>

        {/* Right: Requirements & Highlights */}
        <div className="flex-1 bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base mb-4">Krav på hyresgäst</h3>
          
          <ul className="grid gap-3 list-none p-0 m-0">
            {(advertiser.requirements || ["Kräver aktivt medlemskap i studentkår", "Inga betalningsanmärkningar", "Maxinkomst enligt CSN-gräns", "Svenskt personnummer eller samordningsnummer"]).map((req, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="min-w-1.5 min-h-1.5 mt-2 rounded-full bg-green-700/80" />
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

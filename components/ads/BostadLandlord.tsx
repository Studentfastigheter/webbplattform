import Image from "next/image";
import Tag from "@/components/ui/Tag";
import type { AdvertiserSummary } from "@/types";
import { Star } from "lucide-react";

type Props = {
  advertiser: AdvertiserSummary & {
    highlights?: string[];
    reviewCount?: number;
  };
};

export default function BostadLandlord({ advertiser }: Props) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:p-6 sm:rounded-3xl">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-5">
        <div className="flex items-center gap-3 sm:gap-4">
          {advertiser.logoUrl && (
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-50 sm:h-14 sm:w-14">
              <Image
                src={advertiser.logoUrl}
                alt={advertiser.displayName}
                fill
                sizes="56px"
                className="object-contain p-1.5"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
              Din hyresvard
            </p>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
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
                height={18}
                horizontalPadding={8}
                fontSize={10}
              />
              {advertiser.rating && (
                <span className="flex items-center gap-1 text-xs text-amber-700 sm:text-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4" />
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

      <div className="mt-4 grid gap-2.5 text-sm text-gray-800 sm:mt-5 sm:grid-cols-2 sm:gap-3">
        {advertiser.highlights?.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-green-900 sm:mt-2" />
            <p className="text-xs sm:text-sm">{item}</p>
          </div>
        ))}
        {advertiser.contactNote && (
          <div className="flex items-start gap-2 sm:col-span-2">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-green-900 sm:mt-2" />
            <p className="text-xs sm:text-sm">{advertiser.contactNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}

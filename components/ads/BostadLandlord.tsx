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
    <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {advertiser.logoUrl && (
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-50">
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

      <div className="mt-5 grid gap-3 text-sm text-gray-800 sm:grid-cols-2">
        {advertiser.highlights?.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="mt-2 block h-2 w-2 rounded-full bg-green-900" />
            <p>{item}</p>
          </div>
        ))}
        {advertiser.contactNote && (
          <div className="flex items-start gap-2 sm:col-span-2">
            <span className="mt-2 block h-2 w-2 rounded-full bg-green-900" />
            <p>{advertiser.contactNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import { type HousingQueueDTO } from "@/types/queue";
import { MapPin, ShieldCheck, Loader2 } from "lucide-react";

type QueueHeroProps = {
  queue: HousingQueueDTO;
  onJoin?: () => void;
  isJoining?: boolean;
  isLoggedIn?: boolean;
};

const statusStyles = {
  open: {
    label: "Öppen kö",
    className: "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800",
  },
  // Fallback ifall status saknas i DTO (vi sätter 'open' som standard i backend)
  default: {
    label: "Aktiv",
    className: "inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800",
  }
};

export default function QueueHero({ queue, onJoin, isJoining, isLoggedIn }: QueueHeroProps) {
  const approximateWait =
    typeof queue.waitDays === "number"
      ? `${queue.waitDays} dagar`
      : undefined;

  const totalUnits =
    typeof queue.totalUnits === "number"
      ? queue.totalUnits.toLocaleString("sv-SE")
      : undefined;

  const infoItems = [
    { label: "Kötid just nu", value: approximateWait },
    { label: "Bostadsbestånd", value: totalUnits },
    { label: "Aktiva annonser", value: `${queue.activeListings} st` },
  ].filter((item) => Boolean(item.value));

  // Fallbacks för bilder
  const bannerImage = "/images/queue-default-banner.jpg"; // DTO har ingen banner än
  const logoImage = queue.logoUrl || "/logos/default-landlord-logo.svg";
  const location = queue.city || "Plats saknas";
  const description = queue.description ?? "";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      {/* Banner */}
      <div className="relative z-0 w-full aspect-[1128/191] min-h-[120px] bg-gray-100">
        <Image
          src={bannerImage}
          alt={queue.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-6 pt-0 sm:px-8">
        <div className="mt-4 grid grid-cols-1 gap-8 lg:mt-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Vänster kolumn */}
          <div>
            <div className="flex items-start gap-4">
              {/* Logga */}
              <div className="relative -mt-10 h-28 w-28 overflow-hidden rounded-2xl border border-white bg-white shadow-lg">
                <Image
                  src={logoImage}
                  alt={queue.name}
                  fill
                  className="object-contain p-3"
                  unoptimized // Bra om vi använder placeholder-tjänster
                />
              </div>

              <div className="mt-2 flex flex-col text-left">
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {queue.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <span className={statusStyles.open.className}>
                    {statusStyles.open.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-green-900" />
                    {location}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-900">
                Om bostadskön
              </p>
              <ReadMoreComponent
                text={description}
                variant="large"
                className="mt-2"
                textClassName="text-base leading-relaxed text-gray-800"
                moreLabel="Läs mer"
                lessLabel="Visa mindre"
              />
            </div>
          </div>

          {/* Höger kolumn */}
          <div className="flex flex-col gap-4">
            {/* Gå med knapp */}
            <button
              onClick={onJoin}
              disabled={isJoining}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition active:scale-95 ${
                isLoggedIn 
                  ? "bg-black text-white hover:bg-gray-800" 
                  : "bg-green-700 text-white hover:bg-green-800"
              } disabled:opacity-50`}
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Går med...
                </>
              ) : (
                isLoggedIn ? "Ställ dig i kön nu" : "Logga in och gå med"
              )}
            </button>

            {/* Snabbfakta */}
            <aside className="w-full rounded-2xl border border-gray-100 bg-white/70 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-900" />
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Snabbfakta om kön
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex justify-between py-3 text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
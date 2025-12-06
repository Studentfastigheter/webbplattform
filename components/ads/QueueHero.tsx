import Image from "next/image";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import { type AdvertiserSummary, type HousingQueue, type QueueStatus } from "@/types";
import { MapPin, ShieldCheck } from "lucide-react";
import QueueHeroActions from "./QueueHeroActions";

type QueueStats = {
  status: QueueStatus;
  approximateWait?: string;
  model?: string;
  totalUnits?: string;
  feeInfo?: string;
  updatedAt?: string;
};

type QueueDetail = HousingQueue & {
  advertiser: AdvertiserSummary & { reviewCount?: number; highlights?: string[] };
  stats: QueueStats;
  rules?: { title: string; description: string }[];
  bannerImage?: string | null;
  logo?: string | null;
};

type InfoItem = {
  label: string;
  value?: string;
};

const statusStyles: Record<QueueStatus, { label: string; className: string }> = {
  open: {
    label: "Öppen kö",
    className:
      "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800",
  },
  closed: {
    label: "Stängd kö",
    className:
      "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-800",
  },
  paused: {
    label: "Pausad kö",
    className:
      "inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800",
  },
};

export default function QueueHero({ queue }: { queue: QueueDetail }) {
  const infoItems: InfoItem[] = [
    { label: "Status", value: statusStyles[queue.stats.status]?.label },
    { label: "Kötid just nu", value: queue.stats.approximateWait },
    { label: "Kömodell", value: queue.stats.model },
    { label: "Bostadsbestånd", value: queue.stats.totalUnits },
    { label: "Avgifter", value: queue.stats.feeInfo },
    { label: "Senast uppdaterad", value: queue.stats.updatedAt },
  ].filter((item): item is Required<InfoItem> => Boolean(item.value));

  // Banner-bild (LinkedIn SGS-banner om du satt bannerImage, annars fallback)
  const bannerImage =
    (queue as any).bannerImage ||
    queue.logo ||
    queue.advertiser.bannerUrl ||
    "/images/queue-default-banner.jpg";

  // Profilbild / logo
  const logoImage =
    queue.logo ||
    queue.advertiser.logoUrl ||
    "/logos/default-landlord-logo.svg";

  const subtitle =
    queue.advertiser.subtitle || "Studentbostäder och köinformation";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      {/* Banner med LinkedIn-ratio */}
      <div className="relative z-0 w-full aspect-[1128/191] min-h-[120px] sm:min-h-[160px] lg:min-h-[190px] bg-gray-100">
        {bannerImage && (
          <Image
            src={bannerImage}
            alt={queue.name}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-6 pt-0 sm:px-8">
        {/* 2-kolumnslayout: vänster = info + beskrivning, höger = actions + snabbfakta */}
        <div className="mt-4 grid grid-cols-1 gap-8 lg:mt-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Vänster kolumn */}
          <div>
            {/* Logga + namnblock */}
            <div className="flex items-start gap-4">
              {/* Profilbild / logga som överlappar bannern */}
              <div className="relative -mt-10 h-28 w-28 sm:-mt-12 sm:h-32 sm:w-32 lg:-mt-14 lg:h-36 lg:w-36 overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                <Image
                  src={logoImage}
                  alt={queue.name}
                  fill
                  className="object-contain p-3"
                />
              </div>

              {/* Namn, subtitle, plats */}
              <div className="mt-2 flex flex-col text-left">
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  {queue.name}
                </h1>

                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-green-900" />
                    {queue.area}, {queue.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Beskrivning direkt under plats/status */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
                Om bostadskön
              </p>

              <ReadMoreComponent
                text={queue.description}
                variant="large"
                className="mt-2"
                textClassName="text-base leading-relaxed text-gray-800"
                buttonWrapClassName="pb-4"
                moreLabel="Läs mer"
                lessLabel="Visa mindre"
                scrollOffset={400}
              />
            </div>
          </div>

          {/* Höger kolumn: actions + snabbfakta */}
          <div className="flex flex-col gap-4">
            {/* Actionbar (Client Component) */}
            <QueueHeroActions website={queue.website} />

            {/* Snabbfakta-kort */}
            {infoItems.length > 0 && (
              <aside className="w-full rounded-2xl border border-gray-100 bg-white/70 px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-900" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                      Snabbfakta om kön
                    </p>
                    <p className="text-xs text-gray-700">
                      Kötider och riktlinjer i korthet
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {infoItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-3 py-2"
                    >
                      <div className="text-[12px] font-medium text-gray-600">
                        {item.label}
                      </div>
                      <div className="flex-1 text-right text-[13px] text-gray-900">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

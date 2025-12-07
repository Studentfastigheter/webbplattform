import Image from "next/image";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import { type HousingQueueWithRelations, type QueueStatus } from "@/types";
import { MapPin, ShieldCheck } from "lucide-react";
import QueueHeroActions from "./QueueHeroActions";

type InfoItem = {
  label: string;
  value?: string;
};

const statusStyles: Record<QueueStatus, { label: string; className: string }> = {
  open: {
    label: "\u00d6ppen k\u00f6",
    className:
      "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800",
  },
  closed: {
    label: "St\u00e4ngd k\u00f6",
    className:
      "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-800",
  },
  paused: {
    label: "Pausad k\u00f6",
    className:
      "inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800",
  },
};

export default function QueueHero({ queue }: { queue: HousingQueueWithRelations }) {
  const approximateWait =
    typeof queue.approximateWaitDays === "number"
      ? `${queue.approximateWaitDays} dagar`
      : undefined;

  const totalUnits =
    typeof queue.totalUnits === "number"
      ? queue.totalUnits.toLocaleString("sv-SE")
      : undefined;

  const infoItems: InfoItem[] = [
    { label: "Status", value: statusStyles[queue.status]?.label },
    { label: "Kötid just nu", value: approximateWait },
    { label: "Bostadsbestånd", value: totalUnits },
    { label: "Avgifter", value: queue.feeInfo ?? undefined },
    { label: "Senast uppdaterad", value: queue.updatedAt },
  ].filter((item): item is Required<InfoItem> => Boolean(item.value));

  const bannerImage = queue.company?.bannerUrl || "/images/queue-default-banner.jpg";
  const logoImage = queue.company?.logoUrl || "/logos/default-landlord-logo.svg";
  const subtitle =
    queue.company?.subtitle || "Studentbost\u00e4der och k\u00f6information";
  const location =
    [queue.area, queue.city].filter(Boolean).join(", ") || "Plats saknas";
  const description = queue.description ?? "";
  const displayName = queue.company?.name ?? queue.name;

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
        {/* 2-column layout: vanster = info + beskrivning, hoger = actions + snabbfakta */}
        <div className="mt-4 grid grid-cols-1 gap-8 lg:mt-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Vanster kolumn */}
          <div>
            {/* Logga + namnblock */}
            <div className="flex items-start gap-4">
              {/* Profilbild / logga som overlappnar bannern */}
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
                  {displayName}
                </h1>

                {subtitle && (
                  <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-green-900" />
                    {location}
                  </span>
                </div>
              </div>
            </div>

            {/* Beskrivning direkt under plats/status */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
                Om bostadsk\u00f6n
              </p>

              <ReadMoreComponent
                text={description}
                variant="large"
                className="mt-2"
                textClassName="text-base leading-relaxed text-gray-800"
                buttonWrapClassName="pb-4"
                moreLabel="L\u00e4s mer"
                lessLabel="Visa mindre"
                scrollOffset={400}
              />
            </div>
          </div>

          {/* Hoger kolumn: actions + snabbfakta */}
          <div className="flex flex-col gap-4">
            {/* Actionbar (Client Component) */}
            <QueueHeroActions website={queue.website ?? undefined} />

            {/* Snabbfakta-kort */}
            {infoItems.length > 0 && (
              <aside className="w-full rounded-2xl border border-gray-100 bg-white/70 px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-900" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                      Snabbfakta om k\u00f6n
                    </p>
                    <p className="text-xs text-gray-700">
                      K\u00f6tider och riktlinjer i korthet
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

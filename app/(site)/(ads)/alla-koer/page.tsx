"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

import Que_ListingCard from "@/components/Listings/Que_ListingCard";
import QueueFilterButton from "@/components/Listings/Search/QueueFilterButton";
import OneFieldSearch from "@/components/Listings/Search/SearchFilter-1field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

type QueueItem = {
  id: string;
  name: string;
  area: string;
  city: string;
  totalUnits?: number;
  unitsLabel?: string;
  isVerified?: boolean;
  logoUrl: string;
  tags?: string[];
};

const queues: QueueItem[] = [
  {
    id: "sgs-studentbostader",
    name: "SGS Studentbostader",
    area: "Innerstan",
    city: "Goteborg",
    totalUnits: 1200,
    isVerified: true,
    logoUrl: "/logos/sgs-logo.svg",
    tags: ["Korridorer", "Lagenheter", "Moblerat"],
  },
  {
    id: "guldhedens-studiehem",
    name: "Guldhedens Studiehem",
    area: "Guldheden",
    city: "Goteborg",
    totalUnits: 180,
    logoUrl: "/logos/guldhedens_studiehem.png",
    tags: ["Kristet", "Korridorer"],
  },
  {
    id: "sssb",
    name: "SSSB",
    area: "Tekniska Hogskolan",
    city: "Stockholm",
    totalUnits: 800,
    isVerified: true,
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Student", "Stockholm"],
  },
  {
    id: "af-bostader",
    name: "AF Bostader",
    area: "Lund Centrum",
    city: "Lund",
    unitsLabel: "2500 bostader",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poangfri", "Lagenhet"],
  }
];

export default function Page() {
  const router = useRouter();
  const [view, setView] = useState<SwitchSelectValue>("lista");
  const isMapView = view === "karta";
  const totalQueues = queues.length;

  const queueGridClasses = isMapView
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 justify-items-center"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";

  const renderQueueCard = (queue: QueueItem) => (
    <div key={queue.id} className="flex w-full justify-center">
      <Que_ListingCard
        {...queue}
        logoAlt={`${queue.name} logotyp`}
        onViewListings={() => router.push(`/alla-koer/${queue.id}`)}
        onReadMore={() => router.push(`/alla-koer/${queue.id}`)}
      />
    </div>
  );

  const renderMapListings = () => {
    const nodes: ReactNode[] = [];
    const itemsPerRow = 3;
    let rowIndex = 1;
    let i = 0;

    while (i < queues.length) {
      if (rowIndex % 3 === 0) {
        nodes.push(
          <div key={`ad-row-${rowIndex}`} className="col-span-full">
            <div
              className="h-36 w-full rounded-2xl bg-red-500"
              aria-label="Annonsutrymme"
            />
          </div>
        );
        rowIndex += 1;
        continue;
      }

      const rowQueues = queues.slice(i, i + itemsPerRow);
      nodes.push(...rowQueues.map(renderQueueCard));
      i += rowQueues.length;
      rowIndex += 1;
    }

    return nodes;
  };

  return (
    <main className="flex flex-col gap-10 px-4 pb-16 pt-5">
      {/* Sektion 1: filter */}
      <section className="flex justify-center">
        <div className="flex w-full max-w-[1200px] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[280px] flex-1">
              <OneFieldSearch
                className="w-full"
                field={{
                  id: "var",
                  label: "Var",
                  placeholder: "Sök studentstad",
                  options: [
                    { label: "Gäteborg", value: "gäteborg" },
                    { label: "Stockholm", value: "stockholm" },
                    { label: "Uppsala", value: "uppsala" },
                  ],
                }}
                onSubmit={(values) => {
                  console.log("search submit", values);
                }}
              />
            </div>
            <QueueFilterButton
              cities={["Göteborg", "Stockholm", "Lund", "Malmö", "Umeå"]}
              cityCounts={{
                Goteborg: 5,
                Stockholm: 2,
                Lund: 1,
                Malmo: 1,
                Umea: 1,
              }}
              landlords={[
                "SGS",
                "AF Bostader",
                "SSSB",
                "Guldhedens Studiehem",
                "Hembo",
              ]}
              landlordCounts={{
                SGS: 2,
                "AF Bostader": 1,
                SSSB: 1,
                "Guldhedens Studiehem": 1,
                Hembo: 1,
              }}
              onApply={(state) => {
                console.log("queue filters", state);
              }}
            />
          </div>
        </div>
      </section>

      {/* Sektion 2: rubrik + vyval for bostaderna */}
      <section className="w-full">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h2 id="bostader-heading" className="text-base font-semibold text-black">
            Över {totalQueues.toLocaleString("sv-SE")} koer
          </h2>
          <SwitchSelect value={view} onChange={setView} />
        </div>
      </section>

      {/* Sektion 3: annonser (annonsytor hanteras i layouten) */}
      <section className="w-full">
        <FieldSet className="w-full" aria-labelledby="bostader-heading">
          {isMapView ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-start gap-6">
              <div className={queueGridClasses}>{renderMapListings()}</div>
              <div className="min-h-[520px] rounded-2xl bg-blue-500" aria-hidden />
            </div>
          ) : (
            <div className={queueGridClasses}>
              {queues.map((queue) => renderQueueCard(queue))}
            </div>
          )}
        </FieldSet>
      </section>
    </main>
  );
}

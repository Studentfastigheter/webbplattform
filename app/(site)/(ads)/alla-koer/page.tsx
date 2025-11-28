"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import Que_ListingCard from "@/components/Listings/Que_ListingCard";
import QueueFilterButton, {
  type QueueFilterState,
} from "@/components/Listings/Search/QueueFilterButton";
import OneFieldSearch from "@/components/Listings/Search/SearchFilter-1field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

const QueuesMap = dynamic(() => import("@/components/Map/QueuesMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

type QueueItem = {
  id: string;
  name: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  totalUnits?: number;
  unitsLabel?: string;
  isVerified?: boolean;
  landlord: string;
  status?: "open" | "queue";
  logoUrl: string;
  tags?: string[];
};

const queues: QueueItem[] = [
  {
    id: "sgs-studentbostader",
    name: "SGS Studentbostader",
    area: "Innerstan",
    city: "Goteborg",
    lat: 57.7089,
    lng: 11.9746,
    totalUnits: 1200,
    isVerified: true,
    landlord: "SGS",
    status: "open",
    logoUrl: "/logos/sgs-logo.svg",
    tags: ["Korridorer", "Lagenheter", "Moblerat"],
  },
  {
    id: "guldhedens-studiehem",
    name: "Guldhedens Studiehem",
    area: "Guldheden",
    city: "Goteborg",
    lat: 57.6898,
    lng: 11.9856,
    totalUnits: 180,
    landlord: "Guldhedens Studiehem",
    status: "queue",
    logoUrl: "/logos/guldhedens_studiehem.png",
    tags: ["Kristet", "Korridorer"],
  },
  {
    id: "sssb",
    name: "SSSB",
    area: "Tekniska Hogskolan",
    city: "Stockholm",
    lat: 59.3471,
    lng: 18.073,
    totalUnits: 800,
    isVerified: true,
    landlord: "SSSB",
    status: "queue",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Student", "Stockholm"],
  },
  {
    id: "af-bostader",
    name: "AF Bostader",
    area: "Lund Centrum",
    city: "Lund",
    lat: 55.7047,
    lng: 13.191,
    unitsLabel: "2500 bostader",
    landlord: "AF Bostader",
    status: "open",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poangfri", "Lagenhet"],
  },
  {
    id: "af-bostader1",
    name: "AF Bostader",
    area: "Lund Centrum",
    city: "Lund",
    lat: 55.7047,
    lng: 13.191,
    unitsLabel: "2500 bostader",
    landlord: "AF Bostader",
    status: "open",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poangfri", "Lagenhet"],
  },
  {
    id: "af-bostader2",
    name: "AF Bostader",
    area: "Lund Centrum",
    city: "Lund",
    lat: 55.7047,
    lng: 13.191,
    unitsLabel: "2500 bostader",
    landlord: "AF Bostader",
    status: "queue",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poangfri", "Lagenhet"],
  },
  {
    id: "af-bostader3",
    name: "AF Bostader",
    area: "Lund Centrum",
    city: "Lund",
    lat: 55.7047,
    lng: 13.191,
    unitsLabel: "2500 bostader",
    landlord: "AF Bostader",
    status: "queue",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poangfri", "Lagenhet"],
  },
];

export default function Page() {
  const router = useRouter();
  const [view, setView] = useState<SwitchSelectValue>("lista");
  const [searchValues, setSearchValues] = useState<
    Record<string, string | string[] | null>
  >({});
  const [queueFilters, setQueueFilters] = useState<QueueFilterState>({
    cities: [],
    landlords: [],
    status: null,
  });

  const isMapView = view === "karta";

  const filteredQueues = useMemo(() => {
    const searchTerm =
      typeof searchValues.var === "string"
        ? searchValues.var.trim().toLowerCase()
        : "";

    return queues.filter((queue) => {
      const matchesSearch =
        !searchTerm ||
        [queue.name, queue.city, queue.area].some((field) =>
          field.toLowerCase().includes(searchTerm)
        );

      const matchesCity =
        queueFilters.cities.length === 0 ||
        queueFilters.cities.some(
          (city) => city.toLowerCase() === queue.city.toLowerCase()
        );

      const matchesLandlord =
        queueFilters.landlords.length === 0 ||
        queueFilters.landlords.some(
          (landlord) =>
            queue.landlord.toLowerCase() === landlord.toLowerCase()
        );

      const matchesStatus =
        !queueFilters.status ||
        queueFilters.status === "all" ||
        queue.status === queueFilters.status;

      return matchesSearch && matchesCity && matchesLandlord && matchesStatus;
    });
  }, [queueFilters, searchValues]);

  const totalQueues = filteredQueues.length;

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
    return filteredQueues.map(renderQueueCard);
  };

  return (
    <main className="flex flex-col gap-8 px-4 pb-12 pt-4">
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
                  placeholder: "Sok studentstad",
                  options: [
                    { label: "Goteborg", value: "goteborg" },
                    { label: "Stockholm", value: "stockholm" },
                    { label: "Uppsala", value: "uppsala" },
                  ],
                }}
                onSubmit={(values) => setSearchValues(values)}
              />
            </div>
            <QueueFilterButton
              cities={["Goteborg", "Stockholm", "Lund", "Malmo", "Umea"]}
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
                "AF Bostader": 4,
                SSSB: 1,
                "Guldhedens Studiehem": 1,
                Hembo: 1,
              }}
              onApply={(state) => setQueueFilters(state)}
              onClear={() =>
                setQueueFilters({
                  cities: [],
                  landlords: [],
                  status: null,
                })
              }
            />
          </div>
        </div>
      </section>

      {/* Sektion 2: rubrik + vyval for bostaderna */}
      <section className="w-full">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <h2 id="bostader-heading" className="text-base font-semibold text-black">
            Over {totalQueues.toLocaleString("sv-SE")} koer
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
                <div
                  className="rounded-2xl overflow-hidden lg:sticky lg:top-24"
                  style={{ minHeight: 600, height: "min(72vh, 760px)" }}
                >
                <QueuesMap
                  queues={filteredQueues}
                  onOpenQueue={(id) => router.push(`/alla-koer/${id}`)}
                />
                </div>
              </div>
            ) : (
              <div className={queueGridClasses}>
                {filteredQueues.map((queue) => renderQueueCard(queue))}
            </div>
          )}
        </FieldSet>
      </section>
    </main>
  );
}

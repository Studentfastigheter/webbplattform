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
import {
  type AdvertiserSummary,
  type HousingQueue,
  type QueueStatus,
  type Coordinates,
} from "@/types";

const QueuesMap = dynamic(() => import("@/components/Map/QueuesMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

type QueueWithUI = HousingQueue &
  Coordinates & {
    advertiser: AdvertiserSummary;
    logoUrl?: string | null;
    unitsLabel?: string | null;
    isVerified?: boolean;
    status: QueueStatus;
  };

const defaultQueueMeta = {
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const queues: QueueWithUI[] = [
  {
    ...defaultQueueMeta,
    queueId: "sgs-studentbostader",
    companyId: 1001,
    name: "SGS Studentbostäder",
    area: "Innerstan",
    city: "Göteborg",
    lat: 57.7089,
    lng: 11.9746,
    totalUnits: 1200,
    isVerified: true,
    advertiser: {
      userId: 1001,
      type: "company",
      displayName: "SGS Studentbostäder",
      logoUrl: "/logos/sgs-logo.svg",
      subtitle: "Studentbostäder",
    },
    status: "open",
    logoUrl: "/logos/sgs-logo.svg",
    tags: ["Korridorer", "Lägenheter", "Möblerat"],
  },
  {
    ...defaultQueueMeta,
    queueId: "guldhedens-studiehem",
    companyId: 1002,
    name: "Guldhedens Studiehem",
    area: "Guldheden",
    city: "Göteborg",
    lat: 57.6898,
    lng: 11.9856,
    totalUnits: 180,
    advertiser: {
      userId: 1002,
      type: "company",
      displayName: "Guldhedens Studiehem",
      logoUrl: "/logos/guldhedens_studiehem.png",
      subtitle: "Studentbostäder",
    },
    status: "open",
    logoUrl: "/logos/guldhedens_studiehem.png",
    tags: ["Kristet", "Korridorer"],
  },
  {
    ...defaultQueueMeta,
    queueId: "sssb",
    companyId: 1003,
    name: "SSSB",
    area: "Tekniska Hogskolan",
    city: "Stockholm",
    lat: 59.3471,
    lng: 18.073,
    totalUnits: 800,
    isVerified: true,
    advertiser: {
      userId: 1003,
      type: "company",
      displayName: "SSSB",
      logoUrl: "/logos/campuslyan-logo.svg",
      subtitle: "Studentbostäder",
    },
    status: "open",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Student", "Stockholm"],
  },
  {
    ...defaultQueueMeta,
    queueId: "af-bostader",
    companyId: 1004,
    name: "AF Bostäder",
    area: "Lund Centrum",
    city: "Lund",
    lat: 55.7047,
    lng: 13.191,
    unitsLabel: "2500 bostader",
    advertiser: {
      userId: 1004,
      type: "company",
      displayName: "AF Bostäder",
      logoUrl: "/logos/campuslyan-logo.svg",
      subtitle: "Studentbostäder",
    },
    status: "open",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poängfri", "Lägenhet"],
  },
  {
    ...defaultQueueMeta,
    queueId: "af-bostader1",
    companyId: 1005,
    name: "AF Bostäder",
    area: "Lund Centrum",
    city: "Lund",
    lat: 55.7047,
    lng: 13.191,
    unitsLabel: "2500 bostader",
    advertiser: {
      userId: 1005,
      type: "company",
      displayName: "AF Bostäder",
      logoUrl: "/logos/campuslyan-logo.svg",
      subtitle: "Studentbostäder",
    },
    status: "open",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poängfri", "Lägenhet"],
  },
  {
    ...defaultQueueMeta,
    queueId: "af-bostader2",
    companyId: 1006,
    name: "AF Bostäder",
    area: "Lund Centrum",
    city: "Lund",
    lat: 55.7047,
    lng: 13.191,
    unitsLabel: "2500 bostader",
    advertiser: {
      userId: 1006,
      type: "company",
      displayName: "AF Bostäder",
      logoUrl: "/logos/campuslyan-logo.svg",
      subtitle: "Studentbostäder",
    },
    status: "open",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poängfri", "Lägenhet"],
  },
  {
    ...defaultQueueMeta,
    queueId: "af-bostader3",
    companyId: 1007,
    name: "AF Bostäder",
    area: "Lund Centrum",
    city: "Lund",
    lat: 55.7047,
    lng: 13.191,
    unitsLabel: "2500 bostader",
    advertiser: {
      userId: 1007,
      type: "company",
      displayName: "AF Bostäder",
      logoUrl: "/logos/campuslyan-logo.svg",
      subtitle: "Studentbostäder",
    },
    status: "open",
    logoUrl: "/logos/campuslyan-logo.svg",
    tags: ["Poängfri", "Lägenhet"],
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
            queue.advertiser.displayName.toLowerCase() === landlord.toLowerCase()
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

  const renderQueueCard = (queue: QueueWithUI) => {
    const { advertiser: _advertiser, lat: _lat, lng: _lng, ...rest } = queue;
    const queueCardProps = {
      ...rest,
      logoAlt: `${queue.name} logotyp`,
    };

    return (
    <div key={queue.queueId} className="flex w-full justify-center">
      <Que_ListingCard
        name={queueCardProps.name}
        area={queueCardProps.area}
        city={queueCardProps.city}
        totalUnits={queueCardProps.totalUnits}
        unitsLabel={queueCardProps.unitsLabel}
        isVerified={queueCardProps.isVerified}
        logoUrl={queueCardProps.logoUrl}
        logoAlt={queueCardProps.logoAlt}
        tags={queueCardProps.tags}
        onViewListings={() => router.push(`/alla-koer/${queue.queueId}`)}
        onReadMore={() => router.push(`/alla-koer/${queue.queueId}`)}
      />
    </div>
    );
  };

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
                  placeholder: "Sök studentstad",
                  options: [
                    { label: "Göteborg", value: "göteborg" },
                    { label: "Stockholm", value: "stockholm" },
                    { label: "Uppsala", value: "uppsala" },
                  ],
                }}
                onSubmit={(values) => setSearchValues(values)}
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
              landlords={Array.from(
                new Set(queues.map((queue) => queue.advertiser.displayName)),
              )}
              landlordCounts={queues.reduce<Record<string, number>>(
                (acc, queue) => {
                  const key = queue.advertiser.displayName;
                  acc[key] = (acc[key] ?? 0) + 1;
                  return acc;
                },
                {},
              )}
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
            Över {totalQueues.toLocaleString("sv-SE")} köer
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

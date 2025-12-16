"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import Que_ListingCard from "@/components/Listings/Que_ListingCard";
import QueueFilterButton, {
  type QueueFilterState,
} from "@/components/Listings/Search/QueueFilterButton";
import OneFieldSearch from "@/components/Listings/Search/SearchFilter-1field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";
import { backendApi } from "@/lib/api";
import { type AdvertiserSummary, type HousingQueueWithRelations } from "@/types";

const QueuesMap = dynamic(() => import("@/components/Map/QueuesMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

type QueueWithUI = HousingQueueWithRelations & { advertiser?: AdvertiserSummary };

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
  const [queues, setQueues] = useState<QueueWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    backendApi.queues
      .list()
      .then((res) => {
        if (!active) return;
        const mapped = res.map((queue) => ({
          ...queue,
          advertiser: queue.company
            ? {
                type: "company" as const,
                id: queue.company.companyId,
                displayName: queue.company.name,
                logoUrl: queue.company.logoUrl ?? undefined,
                bannerUrl: queue.company.bannerUrl ?? undefined,
                phone: queue.company.phone ?? null,
                contactEmail: queue.company.contactEmail ?? null,
                contactPhone: queue.company.contactPhone ?? null,
                contactNote: queue.company.contactNote ?? null,
                rating: queue.company.rating ?? null,
                subtitle: queue.company.subtitle ?? null,
                description: queue.company.description ?? null,
                website: queue.company.website ?? null,
                city: queue.company.city ?? null,
              }
            : undefined,
        }));
        setQueues(mapped);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda kor.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isMapView = view === "karta";

  const cityOptions = useMemo(
    () =>
      Array.from(
        new Set(queues.map((queue) => queue.city).filter(Boolean))
      ) as string[],
    [queues]
  );

  const landlordOptions = useMemo(
    () =>
      Array.from(
        new Set(
          queues
            .map((queue) => queue.advertiser?.displayName)
            .filter(Boolean)
        )
      ) as string[],
    [queues]
  );

  const cityCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    queues.forEach((queue) => {
      const city = queue.city ?? "Okand";
      acc[city] = (acc[city] ?? 0) + 1;
    });
    return acc;
  }, [queues]);

  const landlordCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    queues.forEach((queue) => {
      const key = queue.advertiser?.displayName ?? "Okand";
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, [queues]);

  const filteredQueues = useMemo(() => {
    const searchTerm =
      typeof searchValues.var === "string"
        ? searchValues.var.trim().toLowerCase()
        : "";

    return queues.filter((queue) => {
      const matchesSearch =
        !searchTerm ||
        [queue.name, queue.city, queue.area].some((field) =>
          field?.toLowerCase().includes(searchTerm)
        );

      const matchesCity =
        queueFilters.cities.length === 0 ||
        queueFilters.cities.some(
          (city) => city.toLowerCase() === queue.city?.toLowerCase()
        );

      const matchesLandlord =
        queueFilters.landlords.length === 0 ||
        queueFilters.landlords.some(
          (landlord) =>
            queue.advertiser?.displayName?.toLowerCase() === landlord.toLowerCase()
        );

      const matchesStatus =
        !queueFilters.status ||
        queueFilters.status === "all" ||
        queue.status === queueFilters.status;

      return matchesSearch && matchesCity && matchesLandlord && matchesStatus;
    });
  }, [queueFilters, queues, searchValues]);

  const mapQueues = useMemo(
    () =>
      filteredQueues.filter(
        (
          queue,
        ): queue is QueueWithUI & {
          lat: number;
          lng: number;
          advertiser: AdvertiserSummary;
        } =>
          typeof queue.lat === "number" &&
          typeof queue.lng === "number" &&
          Boolean(queue.advertiser)
      ),
    [filteredQueues]
  );

  const totalQueues = filteredQueues.length;

  const queueGridClasses = isMapView
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 justify-items-center"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";

  const renderQueueCard = (queue: QueueWithUI) => {
    const logoUrl =
      queue.company?.logoUrl ??
      queue.advertiser?.logoUrl ??
      "/logos/campuslyan-logo.svg";
    const queueCardProps = {
      ...queue,
      area: queue.area ?? "",
      city: queue.city ?? "",
      totalUnits: queue.totalUnits ?? undefined,
      unitsLabel: undefined,
      isVerified: queue.company?.verified ?? queue.status === "open",
      logoUrl,
      tags: queue.tags ?? [],
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
    <main className="flex flex-col gap-8 pb-12 pt-4">
      {/* Sektion 1: filter */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[280px] flex-1">
              <OneFieldSearch
                className="w-full"
                field={{
                  id: "var",
                  label: "Var",
                  placeholder: "Sok studentstad",
                  options: cityOptions.map((city) => ({ label: city, value: city })),
                }}
                onSubmit={(values) => setSearchValues(values)}
              />
            </div>
            <QueueFilterButton
              cities={cityOptions}
              cityCounts={cityCounts}
              landlords={landlordOptions}
              landlordCounts={landlordCounts}
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
            Over {totalQueues.toLocaleString("sv-SE")} kor
          </h2>
          <SwitchSelect value={view} onChange={setView} />
        </div>
      </section>

      {/* Sektion 3: annonser (annonsytor hanteras i layouten) */}
      <section className="w-full">
        <FieldSet className="w-full" aria-labelledby="bostader-heading">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Laddar kor...
            </div>
          ) : filteredQueues.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Inga kor att visa just nu.
            </div>
          ) : isMapView ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-6">
              <div className={queueGridClasses}>{renderMapListings()}</div>
              <div
                className="rounded-2xl overflow-hidden lg:sticky lg:top-24"
                style={{ minHeight: 600, height: "min(72vh, 760px)" }}
              >
                <QueuesMap
                  queues={mapQueues}
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

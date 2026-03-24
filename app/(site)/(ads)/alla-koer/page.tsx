"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import Que_ListingCard from "@/components/Listings/Que_ListingCard";
import QueueFilterButton, {
  type QueueFilterState,
} from "@/components/Listings/Search/QueueFilterButton";
import SearchFilterBar2 from "@/components/Listings/Search/SearchFilterBar2";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

import { queueService } from "@/services/queue-service";
import { getCityCoordinates } from "@/services/geolocator-service";

import { type HousingQueueDTO, type QueueMapItem } from "@/types/queue";
import { type AdvertiserSummary } from "@/types/common";
import { type CompanyId } from "@/types";

import { uniqueOnly, removeEmpty, toSearchString, searchStringMatches } from "@/lib/utils";

const QueuesMap = dynamic(() => import("@/components/Map/QueuesMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[520px] rounded-2xl bg-gray-100" aria-hidden />
  ),
});

// User search entries
type SearchValues = {

    // Entered city name
    location: string;

    // Id of selected queue
    queueId: string;
};

const PAGE_SIZE = 6;

export default function Page() {
    const router = useRouter();
    const [view, setView] = useState<SwitchSelectValue>("lista");
    const [searchValues, setSearchValues] = useState<SearchValues>({ location: "", queueName: "" });
    const [queues, setQueues] = useState<QueueWithUI[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [selectedQueues, setSelectedQueues] = useState<Set<string>>(new Set());
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const queuesById = useMemo(() => {
      const result: Record<string, QueueWithUI> = {};
      for (const queue of queues) {
        result[queue.id] = queue;
      }
      return result;
    }, [queues]);

    useEffect(() => {
        let active = true;
        setLoading(true);

        queueService
        .list()
        .then((res) => {
            if (!active)
                return;
            (async () => {
                const mapped: AdvertisedHousingQueue[] = await Promise.all(res.map(async dto => {
                    const base: AdvertisedHousingQueue = {
                        ...dto,
                        advertiser: {
                            type: "company",
                            id: dto.companyId as unknown as CompanyId,
                            displayName: dto.name,
                            logoUrl: dto.logoUrl,
                            bannerUrl: undefined,
                            phone: null,
                            contactEmail: null,
                            contactPhone: null,
                            contactNote: null,
                            rating: null,
                            subtitle: null,
                            description: dto.description ?? null,
                            website: null,
                            city: dto.city,
                        }
                    };
                    const coord: Coordinates = await getCityCoordinates(dto.city);
                    return coord.lng && coord.lat ? {
                        ...base,
                        lng: coord.lng,
                        lat: coord.lat
                    } as QueueMapItem : base;
                }));

                setQueues(mapped);
                setVisibleCount(PAGE_SIZE);
            })();
        })
        .catch((err: any) => {
          if (!active)
              return;
          console.error(err);
          setError("Kunde inte ladda köer.");
        })
        .finally(() => {
          if (!active)
              return;
          setLoading(false);
        });
        return () => {
            active = false;
        };
    }, []);

    const isMapView = view === "karta";

    const cityOptions = useMemo(
      () => {
        const options = uniqueOnly(removeEmpty(queues.map((queue) => queue.city)));
        const asRecord: Record<string, string> = {};
        for (const option of options) {
          asRecord[option] = option;
        }
        return asRecord;
      },
      [queues]
    );
    const queueOptions = useMemo(() => {
      const results: Record<string, string> = {};
      for (const queue of queues) {
        results[queue.name] = queue.id;
      }
      return results;
    }, [queues]);

    const filteredQueues = useMemo(() => {
        return queues.filter((queue) =>
            searchStringMatches(searchValues.location, queue.city) &&
            searchStringMatches(searchValues.queueId, queue.id));
    }, [queues, searchValues]);

    useEffect(() => {
        setVisibleCount(Math.min(PAGE_SIZE, filteredQueues.length));
    }, [filteredQueues.length]);

    const hasMore = visibleCount < filteredQueues.length;
    const visibleQueues = useMemo(
        () => filteredQueues.slice(0, visibleCount),
        [filteredQueues, visibleCount]
    );

    const mapQueues = useMemo(() =>
        visibleQueues.filter((queue): queue is QueueMapItem => Boolean(queue.advertiser)),
      [visibleQueues]
    );

    const totalQueues = filteredQueues.length;

    const queueGridClasses = isMapView
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 justify-items-center"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 justify-items-center";

    const renderQueueCard = (queue: QueueWithUI) => {
        const logoUrl = queue.logoUrl || "/logos/campuslyan-logo.svg";

        const queueCardProps = {
            ...queue,
            area: "", 
            city: queue.city ?? "",
            totalUnits: queue.totalUnits ?? undefined,
            unitsLabel: undefined,
            isVerified: true, 
            logoUrl,
            tags: queue.tags ?? [],
            logoAlt: `${queue.name} logotyp`,
        };

        return (
        <div key={queue.id} className="flex w-full justify-center">
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
            isSelected={selectedQueues.has(queue.id)}
            onViewListings={() => router.push(`/alla-koer/${queue.companyId}`)}
            onToggleSelect={() => {
              const next = new Set(selectedQueues);
              if (next.has(queue.id)) {
                next.delete(queue.id);
              } else {
                next.add(queue.id);
              }
              setSelectedQueues(next);
            }}
            />
        </div>);
    };

    const renderMapListings = () => {
        return visibleQueues.map(renderQueueCard);
    };

    useEffect(() => {
        if (!hasMore || loading || loadingMore)
            return;
        const target = loadMoreRef.current;
        if (!target)
            return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry?.isIntersecting && hasMore && !loadingMore) {
                    setLoadingMore(true);
                    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredQueues.length));
                    requestAnimationFrame(() => setLoadingMore(false));
                }
            },
            { rootMargin: "320px" }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [filteredQueues.length, hasMore, loading, loadingMore]);

    return (
      <main className="flex flex-col gap-6 sm:gap-8 pb-12 pt-4 w-full h-auto">
        {/* Same layout technique as in /bostader */}
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-auto">
          {/* Filters */}
          <section className="w-full">
            <div className="flex w-full flex-col gap-3 sm:gap-4">
              <div className="flex flex-col lg:flex-row lg:items-start xl:items-center gap-3 sm:gap-4">
                <div className="w-full lg:flex-1">
                  <SearchFilterBar2
                    className="w-full"
                    fields={[
                      {
                        id: "location",
                        label: "Var",
                        placeholder: "Sök studentstad",
                        options: { "Överallt": "", ...cityOptions }
                      },
                      {
                        id: "queueId",
                        label: "Bostadskö",
                        placeholder: "Sök specifik bostadskö",
                        options: { "Alla": "", ...queueOptions }
                      }
                    ]}
                    onSubmit={(values) => {
                      console.log(`Search values are: location=${values.location}, queueName=${values.queueName}`);
                      setSearchValues({
                        location: values.location,
                        queueId: values.queueId,
                      });
                    }}
                  />
                </div>
            </div>
            </div>
          </section>

          {/* Rubric */}
          <section className="w-full mt-6 sm:mt-8">
            <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <h2 id="bostader-heading" className="text-base sm:text-lg font-semibold text-black">
                Över {totalQueues.toLocaleString("sv-SE")} köer
              </h2>
              <SwitchSelect value={view} onChange={setView} />
            </div>
          </section>

          {/* Listings */}
          <section className="w-full min-h-[400px] mt-4 sm:mt-6">
            <FieldSet className="w-full" aria-labelledby="bostader-heading">
              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  Laddar köer...
                </div>
              ) : filteredQueues.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  Inga köer att visa just nu.
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
                      onOpenQueue={(id) => router.push(`/alla-koer/${queuesById[id]}`)}
                    />
                  </div>
                </div>
              ) : (
                <div className={queueGridClasses}>
                  {visibleQueues.map((queue) => renderQueueCard(queue))}
                </div>
              )}
              {(hasMore || loadingMore) && (
                <div
                  ref={loadMoreRef}
                  className="flex w-full items-center justify-center py-6 sm:py-8 min-h-[60px]"
                  aria-hidden
                >
                  {loadingMore && (
                    <span className="text-xs text-gray-500">Laddar fler köer...</span>
                  )}
                </div>
              )}
            </FieldSet>
          </section>
        </div>

        {/* Sticky bottom bar for queue selection */}
        {selectedQueues.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-xl ring-1 ring-black/5">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {selectedQueues.size} {selectedQueues.size === 1 ? "kö vald" : "köer valda"}
              </span>
              <div className="h-5 w-px bg-gray-200" />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setSelectedQueues(new Set())}
              >
                Rensa val
              </Button>
              <Button
                type="button"
                size="sm"
                variant="default"
              >
                Ställ mig i kö
              </Button>
            </div>
          </div>
        )}
      </main>
    );
}

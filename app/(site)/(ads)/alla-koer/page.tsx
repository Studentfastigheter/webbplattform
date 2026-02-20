"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import Que_ListingCard from "@/components/Listings/Que_ListingCard";
import QueueFilterButton, {
  type QueueFilterState,
} from "@/components/Listings/Search/QueueFilterButton";
import TwoFieldSearch from "@/components/Listings/Search/SearchFilter-2field";
import { FieldSet } from "@/components/ui/field";
import SwitchSelect, { SwitchSelectValue } from "@/components/ui/switchSelect";

// ÄNDRING 1: Byt till queueService (den har metoden list() som matchar din backend)
import { queueService } from "@/services/queue-service";
import { getCityCoordinates } from "@/services/geolocator-service";

// ÄNDRING 2: Importera typer från rätt filer
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

    // Entered queue name
    queueName: string;
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
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let active = true;
        setLoading(true);

        // ÄNDRING 3: Använd queueService.list()
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
                    console.log(`Found coords of ${dto.city} at ${coord.lng}:${coord.lat}`)
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
      () => uniqueOnly(removeEmpty(queues.map((queue) => queue.city))),
      [queues]
    );

    const filteredQueues = useMemo(() => {
        return queues.filter((queue) =>
            searchStringMatches(searchValues.location, queue.city) &&
            searchStringMatches(searchValues.queue, queue.name));
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
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";

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
    
            // --- ÄNDRING 4: Navigera till dynamisk ID-sida ---
            onViewListings={() => router.push(`/alla-koer/${queue.id}`)} 
            onReadMore={() => router.push(`/alla-koer/${queue.id}`)}
            // ------------------------------------------------
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
      <main className="flex flex-col gap-8 pb-12 pt-4">
        {/* Sektion 1: filter */}
        <section className="w-full">
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[280px] flex-1">
                <TwoFieldSearch
                  className="w-full"
                  field1={{
                    id: "location",
                    label: "Var",
                    placeholder: "Sök studentstad",
                    searchable: true,
                    options: cityOptions.map((city) => ({ label: city, value: city })),
                  }}
                  field2={{
                    id: "queueName",
                    label: "Bostadskö",
                    placeholder: "Sök specifik bostadskö",
                    searchable: true,
                    options: queues.map((queue) => ({ label: queue.name, value: queue.name }))
                  }}
                  onSubmit={(values) => setSearchValues({
                    location: values.location,
                    queueName: values.queueName
                  })}
                />
              </div>
           </div>
          </div>
        </section>

        {/* Sektion 2: rubrik + vyval */}
        <section className="w-full">
          <div className="flex w-full flex-wrap items-center justify-between gap-4">
            <h2 id="bostader-heading" className="text-base font-semibold text-black">
              Över {totalQueues.toLocaleString("sv-SE")} köer
            </h2>
            <SwitchSelect value={view} onChange={setView} />
          </div>
        </section>

        {/* Sektion 3: annonser */}
        <section className="w-full">
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
                    // --- ÄNDRING 5: Navigera med ID från kartan ---
                    onOpenQueue={(id) => router.push(`/alla-koer/${id}`)}
                    // ----------------------------------------------
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
                className="flex w-full items-center justify-center py-4"
                aria-hidden
              >
                {loadingMore && (
                  <span className="text-xs text-gray-500">Laddar fler köer...</span>
                )}
              </div>
            )}
          </FieldSet>
        </section>
      </main>
    );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import Que_ListingCard from "@/components/Listings/Que_ListingCard";
import QueueFilterButton, {
  type QueueFilterState,
} from "@/components/Listings/Search/QueueFilterButton";
import { FieldSet } from "@/components/ui/field";
import { useAuth } from "@/context/AuthContext";

import { buildJoinedQueueIdSet, queueService } from "@/services/queue-service";

import { type AdvertisedHousingQueue } from "@/types/queue";
import { type CompanyId } from "@/types";

import { removeEmpty, toSearchString, uniqueOnly } from "@/lib/utils";

type SearchValues = {
  queueName: string;
};

type QueueWithUI = AdvertisedHousingQueue;

const PAGE_SIZE = 6;

const defaultQueueFilterState: QueueFilterState = {
  cities: [],
  landlords: [],
  status: null,
};

const countByValue = (values: string[]) =>
  values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});

interface CityFilterContainerProps {
  cities: string[];
  cityCounts: Record<string, number>;
  activeCities: string[];
  onSelect: (city: string | null) => void;
}

const CityFilterContainer = ({
  cities,
  cityCounts,
  activeCities,
  onSelect,
}: CityFilterContainerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_VISIBLE_COUNT = 8;

  const sortedCities = useMemo(() => {
    return [...cities].sort(
      (a, b) => (cityCounts[b] || 0) - (cityCounts[a] || 0)
    );
  }, [cities, cityCounts]);

  const visibleCities = isExpanded
    ? sortedCities
    : sortedCities.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = sortedCities.length > INITIAL_VISIBLE_COUNT;

  return (
    <div className="mt-6 flex flex-col items-center gap-5">
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`group flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
            activeCities.length === 0
              ? "bg-[#004225] text-white shadow-[0_8px_20px_-6px_rgba(0,66,37,0.4)] scale-105"
              : "bg-white text-gray-700 ring-1 ring-black/[0.08] hover:ring-black/20 hover:bg-gray-50"
          }`}
        >
          <MapPin
            className={`h-4 w-4 transition-transform group-hover:scale-110 ${
              activeCities.length === 0 ? "text-white" : "text-[#004225]"
            }`}
          />
          Alla städer
        </button>
        {visibleCities.map((city) => {
          const isSelected =
            activeCities.includes(city) && activeCities.length === 1;
          return (
            <button
              key={city}
              type="button"
              onClick={() => onSelect(isSelected ? null : city)}
              className={`flex shrink-0 items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                isSelected
                  ? "bg-[#004225] text-white shadow-[0_8px_20px_-6px_rgba(0,66,37,0.4)] scale-105"
                  : "bg-white text-gray-700 ring-1 ring-black/[0.08] hover:ring-black/20 hover:bg-gray-50"
              }`}
            >
              <span className="leading-none">{city}</span>
              <span
                className={`flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold transition-colors ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {cityCounts[city] || 0}
              </span>
            </button>
          );
        })}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-sm font-bold text-[#004225] transition-opacity hover:opacity-80"
        >
          <span className="underline underline-offset-4 decoration-2 decoration-[#004225]/30 hover:decoration-[#004225]">
            {isExpanded
              ? "Visa färre städer"
              : `Visa alla ${cities.length} städer`}
          </span>
          <div
            className={`h-1.5 w-1.5 rounded-full bg-[#004225] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
};

export default function Page() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchValues, setSearchValues] = useState<SearchValues>({
    queueName: "",
  });
  const [filters, setFilters] = useState<QueueFilterState>(
    defaultQueueFilterState
  );
  const [queues, setQueues] = useState<QueueWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedQueues, setSelectedQueues] = useState<Set<string>>(new Set());
  const [joinedQueueIds, setJoinedQueueIds] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    queueService
      .getAll()
      .then(async (res) => {
        if (!active) return;

        const uniqueCompanyIds = [
          ...new Set(res.map((dto) => dto.companyId).filter(Boolean)),
        ];
        const companyMap = new Map<number, { logoUrl?: string }>();

        await Promise.all(
          uniqueCompanyIds.map(async (companyId) => {
            try {
              const company = await queueService.getCompany(companyId);
              companyMap.set(companyId, company);
            } catch {
              // If the company request fails, keep the queue's own logo.
            }
          })
        );

        const mapped: QueueWithUI[] = res.map((dto) => {
          const companyLogo = companyMap.get(dto.companyId)?.logoUrl;
          return {
            ...dto,
            logoUrl: companyLogo || dto.logoUrl,
            advertiser: {
              type: "company",
              id: dto.companyId as unknown as CompanyId,
              displayName: dto.name,
              logoUrl: companyLogo || dto.logoUrl,
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
            },
          };
        });

        if (!active) return;
        setQueues(mapped);
        setVisibleCount(PAGE_SIZE);
      })
      .catch((err: any) => {
        if (!active) return;
        console.error(err);
        setError("Kunde inte ladda köer.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setJoinedQueueIds(new Set());
      return;
    }

    let active = true;

    queueService
      .getMyQueues()
      .then((applications) => {
        if (!active) return;

        const nextJoinedQueueIds = buildJoinedQueueIdSet(applications);
        setJoinedQueueIds(nextJoinedQueueIds);
        setSelectedQueues((current) => {
          const next = new Set(
            [...current].filter((queueId) => !nextJoinedQueueIds.has(queueId))
          );
          return next.size === current.size ? current : next;
        });
      })
      .catch((err) => {
        if (!active) return;
        console.error("Kunde inte hämta användarens köer:", err);
        setJoinedQueueIds(new Set());
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const cityFilterOptions = useMemo(
    () =>
      uniqueOnly(removeEmpty(queues.map((queue) => queue.city))).sort((a, b) =>
        a.localeCompare(b, "sv")
      ),
    [queues]
  );
  const landlordFilterOptions = useMemo(
    () =>
      uniqueOnly(removeEmpty(queues.map((queue) => queue.name))).sort((a, b) =>
        a.localeCompare(b, "sv")
      ),
    [queues]
  );
  const cityCounts = useMemo(
    () => countByValue(removeEmpty(queues.map((queue) => queue.city))),
    [queues]
  );
  const landlordCounts = useMemo(
    () => countByValue(removeEmpty(queues.map((queue) => queue.name))),
    [queues]
  );

  const filteredQueues = useMemo(() => {
    const queueSearch = toSearchString(searchValues.queueName);

    return queues.filter((queue) => {
      const matchesSearch =
        !queueSearch || toSearchString(queue.name).includes(queueSearch);
      const matchesCity =
        filters.cities.length === 0 || filters.cities.includes(queue.city);
      const matchesLandlord =
        filters.landlords.length === 0 ||
        filters.landlords.includes(queue.name);

      return matchesSearch && matchesCity && matchesLandlord;
    });
  }, [queues, searchValues, filters]);

  const unjoinedFilteredQueues = useMemo(
    () => filteredQueues.filter((q) => !joinedQueueIds.has(q.id)),
    [filteredQueues, joinedQueueIds]
  );

  const allFilteredSelected = useMemo(() => {
    if (unjoinedFilteredQueues.length === 0) return false;
    return unjoinedFilteredQueues.every((q) => selectedQueues.has(q.id));
  }, [unjoinedFilteredQueues, selectedQueues]);

  const toggleSelectAllInCity = () => {
    const next = new Set(selectedQueues);
    if (allFilteredSelected) {
      unjoinedFilteredQueues.forEach((q) => next.delete(q.id));
    } else {
      unjoinedFilteredQueues.forEach((q) => next.add(q.id));
    }
    setSelectedQueues(next);
  };

  useEffect(() => {
    setVisibleCount(Math.min(PAGE_SIZE, filteredQueues.length));
  }, [filteredQueues.length]);

  const hasMore = visibleCount < filteredQueues.length;
  const visibleQueues = useMemo(
    () => filteredQueues.slice(0, visibleCount),
    [filteredQueues, visibleCount]
  );

  const totalQueues = filteredQueues.length;

  const queueGridClasses =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-5 justify-items-center";

  const openQueue = (queue: QueueWithUI) => {
    router.push(`/alla-koer/${queue.companyId}`);
  };

  const renderQueueCard = (queue: QueueWithUI) => {
    const logoUrl = queue.logoUrl || "/logos/campuslyan-logo.svg";
    const isAlreadyJoined = joinedQueueIds.has(queue.id);

    const queueCardProps = {
      ...queue,
      area: "",
      city: queue.city ?? "",
      totalUnits: queue.totalUnits ?? undefined,
      unitsLabel: undefined,
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
          logoUrl={queueCardProps.logoUrl}
          logoAlt={queueCardProps.logoAlt}
          tags={queueCardProps.tags}
          isSelected={selectedQueues.has(queue.id)}
          isAlreadyJoined={isAlreadyJoined}
          onViewListings={() => openQueue(queue)}
          onToggleSelect={() => {
            if (isAlreadyJoined) return;

            const next = new Set(selectedQueues);
            if (next.has(queue.id)) {
              next.delete(queue.id);
            } else {
              next.add(queue.id);
            }
            setSelectedQueues(next);
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_SIZE, filteredQueues.length)
          );
          requestAnimationFrame(() => setLoadingMore(false));
        }
      },
      { rootMargin: "320px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredQueues.length, hasMore, loading, loadingMore]);

  return (
    <main className="flex h-auto w-full flex-col gap-6 pb-12 pt-4 sm:gap-8">
      <div className="container mx-auto h-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <section className="mt-6 w-full sm:mt-12">
          <div className="flex w-full flex-col gap-3 sm:gap-4">
            <div className="flex w-full flex-col items-stretch gap-3 sm:gap-4 md:flex-row md:items-center md:justify-center lg:grid lg:grid-cols-[1fr_minmax(0,680px)_1fr] xl:grid-cols-[1fr_minmax(0,760px)_1fr] 2xl:grid-cols-[1fr_minmax(0,840px)_1fr]">
              <div className="w-full md:max-w-[620px] md:flex-1 lg:col-start-2 lg:max-w-none">
                <form
                  className="flex h-11 w-full items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-4 pr-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] sm:h-12 sm:gap-3 sm:pl-5 xl:h-14 xl:pl-6 xl:pr-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSearchValues({
                      queueName: toSearchString(searchInput),
                    });
                  }}
                >
                  <Search className="h-[18px] w-[18px] shrink-0 text-black/55 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Sök efter bostadskö"
                    className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45 sm:text-base"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      aria-label="Rensa sökning"
                      onClick={() => {
                        setSearchInput("");
                        setSearchValues({ queueName: "" });
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#004225] transition-colors hover:bg-[#004225]/5 sm:h-8 sm:w-8"
                    >
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="h-8 shrink-0 rounded-full bg-[#004225] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#004225]/90 sm:h-9 sm:px-5 xl:h-10 xl:px-6"
                  >
                    Sök
                  </button>
                </form>
              </div>
              <div className="w-auto self-center md:shrink-0 lg:col-start-3 lg:justify-self-start">
                <QueueFilterButton
                  variant="ghost"
                  size="icon-lg"
                  title="Avancerade filter"
                  triggerLabel="Filtrera"
                  className="h-10 w-auto min-w-0 rounded-full border-0 bg-transparent px-2 text-sm font-medium text-[#004225] shadow-none hover:bg-transparent sm:h-12 sm:text-base xl:h-14 [&_svg]:h-[18px] [&_svg]:w-[18px] sm:[&_svg]:h-5 sm:[&_svg]:w-5"
                  cities={cityFilterOptions}
                  cityCounts={cityCounts}
                  landlords={landlordFilterOptions}
                  landlordCounts={landlordCounts}
                  statuses={[]}
                  initialState={defaultQueueFilterState}
                  onApply={(state) => setFilters(state)}
                  onClear={() => setFilters(defaultQueueFilterState)}
                />
              </div>
            </div>

            {/* City filter pills — wrapped flex container for better accessibility and no horizontal scrolling */}
            {cityFilterOptions.length > 0 && (
              <CityFilterContainer
                cities={cityFilterOptions}
                cityCounts={cityCounts}
                activeCities={filters.cities}
                onSelect={(city) =>
                  setFilters({
                    ...filters,
                    cities: city === null ? [] : [city],
                  })
                }
              />
            )}
          </div>
        </section>

        <section className="mt-6 w-full sm:mt-8">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
              <h2
                id="koer-heading"
                className="text-base font-semibold text-black sm:text-lg"
              >
                {loading && queues.length === 0
                  ? "Laddar köer..."
                  : filters.cities.length === 1
                    ? `${totalQueues.toLocaleString("sv-SE")} köer i ${filters.cities[0]}`
                    : `Över ${totalQueues.toLocaleString("sv-SE")} köer`}
              </h2>
              {filters.cities.length === 1 &&
                unjoinedFilteredQueues.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAllInCity}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004225] transition-opacity hover:opacity-80 sm:text-sm"
                  >
                    {allFilteredSelected ? (
                      <>
                        <X className="h-3.5 w-3.5" />
                        Avmarkera alla
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Välj alla i {filters.cities[0]}
                      </>
                    )}
                  </button>
                )}
            </div>
            {filters.cities.length === 1 && (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, cities: [] })}
                className="inline-flex items-center gap-1 self-start text-xs font-medium text-gray-500 hover:text-black sm:text-sm"
              >
                <X className="h-3.5 w-3.5" />
                Rensa stadsfilter
              </button>
            )}
          </div>
        </section>

        <section className="mt-4 min-h-[400px] w-full sm:mt-6">
          <FieldSet className="w-full" aria-labelledby="koer-heading">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-800 sm:px-4 sm:text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Laddar köer...
              </div>
            ) : filteredQueues.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 sm:py-20 sm:text-base">
                Inga köer matchade din sökning.
              </div>
            ) : (
              <div className={queueGridClasses}>
                {visibleQueues.map((queue) => renderQueueCard(queue))}
              </div>
            )}

            {(hasMore || loadingMore) && (
              <div
                ref={loadMoreRef}
                className="flex min-h-[60px] w-full items-center justify-center py-6 sm:py-8"
                aria-hidden
              >
                {loadingMore && (
                  <span className="text-xs text-gray-500">
                    Laddar fler köer...
                  </span>
                )}
              </div>
            )}
          </FieldSet>
        </section>
      </div>

      {selectedQueues.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-xl ring-1 ring-black/5">
            <span className="whitespace-nowrap text-sm font-medium text-gray-700">
              {selectedQueues.size}{" "}
              {selectedQueues.size === 1 ? "kö vald" : "köer valda"}
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
            <Button type="button" size="sm" variant="default">
              Ställ mig i kö
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

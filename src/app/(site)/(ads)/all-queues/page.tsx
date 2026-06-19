"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Search, X } from "@/components/icons";

import { Button } from "@/components/ui/button";
import Que_ListingCard from "@/features/listings/components/Que_ListingCard";
import QueueFilterButton, {
  type QueueFilterState,
} from "@/features/listings/components/Search/QueueFilterButton";
import { FieldSet } from "@/components/ui/field";

import { type CompanyPublicDTO } from "@/features/companies/services/company-service";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { buildJoinedQueueIdSet } from "@/features/queues/services/queue-service";
import { useMyQueues, useJoinQueue } from "@/features/queues/hooks/useQueues";
import { useAuth } from "@/context/AuthContext";
import { type CompanyId } from "@/types";

import { getApplicationVerificationError } from "@/lib/application-eligibility";
import { removeEmpty, toSearchString, uniqueOnly } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

type SearchValues = {
  queueName: string;
};

type CompanyQueueCard = {
  id: string;
  companyId: number;
  housingQueueId?: string | null;
  name: string;
  cities?: string[];
  description?: string | null;
  subtitle?: string | null;
  logoUrl?: string | null;
  termsUrl?: string | null;
  privacyUrl?: string | null;
  advertiser: {
    type: "company";
    id: CompanyId;
    displayName: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    phone: null;
    contactEmail: null;
    contactPhone: null;
    contactNote: null;
    rating: null;
    subtitle?: string | null;
    description?: string | null;
    website: null;
    city: string | null;
  };
};

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

const cleanStrings = (values: Array<string | null | undefined>) =>
  removeEmpty(values).filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );

const formatCityName = (value: string) => {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return "";

  return trimmed
    .toLocaleLowerCase("sv-SE")
    .replace(/(^|[\s-])\p{L}/gu, (match) => match.toLocaleUpperCase("sv-SE"));
};

function mapCompanyToCard(company: CompanyPublicDTO): CompanyQueueCard {
  const cities = Array.isArray(company.cities)
    ? company.cities.map(formatCityName).filter((city) => city.length > 0)
    : [];

  return {
    id: String(company.id),
    companyId: company.id,
    housingQueueId: company.housingQueueId ?? null,
    name: company.name,
    cities,
    description: company.description ?? null,
    subtitle: company.subtitle ?? null,
    logoUrl: company.logoUrl ?? null,
    termsUrl: company.termsUrl ?? null,
    privacyUrl: company.privacyUrl ?? null,
    advertiser: {
      type: "company",
      id: company.id as unknown as CompanyId,
      displayName: company.name,
      logoUrl: company.logoUrl ?? null,
      bannerUrl: null,
      phone: null,
      contactEmail: null,
      contactPhone: null,
      contactNote: null,
      rating: null,
      subtitle: company.subtitle ?? null,
      description: company.description ?? company.subtitle ?? null,
      website: null,
      city: cities[0] ?? null,
    },
  };
}

const getJoinQueueId = (queue: CompanyQueueCard): string | null =>
  queue.housingQueueId ? String(queue.housingQueueId) : null;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, localizedHref, t } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const numberLocale = locale === "sv" ? "sv-SE" : "en-US";
  const cityFromUrl = formatCityName(searchParams.get("city") ?? "");
  const [searchInput, setSearchInput] = useState("");
  const [searchValues, setSearchValues] = useState<SearchValues>({
    queueName: "",
  });
  const [filters, setFilters] = useState<QueueFilterState>(() => ({
    ...defaultQueueFilterState,
    cities: cityFromUrl ? [cityFromUrl] : [],
  }));
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedQueues, setSelectedQueues] = useState<Set<string>>(new Set());
  const [joiningSelectedQueues, setJoiningSelectedQueues] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const queueVerificationError = useMemo(
    () => getApplicationVerificationError(user, "queue", locale),
    [locale, user]
  );

  // Companies list — cached and shared with /stader, /stader/[stad].
  const {
    data: companiesData,
    isLoading: loading,
    isError: isCompaniesError,
  } = useCompanies();
  const error = isCompaniesError ? "Kunde inte ladda företag." : null;

  // Map raw companies → card shape. Memoized so identity is stable across
  // re-renders driven by filter/search changes.
  const queues = useMemo<CompanyQueueCard[]>(
    () => (companiesData ?? []).map(mapCompanyToCard),
    [companiesData]
  );

  // My queues — used here only for membership lookup (no hydration needed).
  // Shared with the /alla-koer/[id] page so navigating between them is free.
  const { data: myQueues, isLoading: myQueuesLoading } = useMyQueues({
    hydrated: false,
  });
  const joinedQueueIds = useMemo<Set<string>>(
    () => (user && myQueues ? buildJoinedQueueIdSet(myQueues) : new Set()),
    [user, myQueues]
  );

  // Mutation: join queue. Each call invalidates the my-queues cache on
  // settle (success or fail), which is what re-syncs joinedQueueIds above.
  const joinQueue = useJoinQueue();

  const isCompanyQueueJoined = (queue: CompanyQueueCard) => {
    const joinQueueId = getJoinQueueId(queue);
    return joinQueueId !== null && joinedQueueIds.has(joinQueueId);
  };

  useEffect(() => {
    setSelectedQueues((current) => {
      const next = new Set(
        Array.from(current).filter((queueId) => {
          if (joinedQueueIds.has(queueId)) {
            return false;
          }

          return true;
        })
      );
      return next.size === current.size ? current : next;
    });
  }, [joinedQueueIds]);

  const cityFilterQueues = queues;

  const cityFilterOptions = useMemo(
    () =>
      uniqueOnly(cleanStrings(cityFilterQueues.flatMap((queue) => queue.cities ?? []))).sort(
        (a, b) => a.localeCompare(b, "sv")
      ),
    [cityFilterQueues]
  );
  const cityCounts = useMemo(
    () => countByValue(cleanStrings(cityFilterQueues.flatMap((queue) => queue.cities ?? []))),
    [cityFilterQueues]
  );

  const filteredQueues = useMemo(() => {
    const queueSearch = toSearchString(searchValues.queueName);

    return queues.filter((queue) => {
      const matchesSearch =
        !queueSearch ||
        toSearchString(queue.name).includes(queueSearch) ||
        toSearchString(queue.subtitle).includes(queueSearch);
      const matchesCity =
        filters.cities.length === 0 ||
        (queue.cities ?? []).some((city) => filters.cities.includes(city));

      return matchesSearch && matchesCity;
    });
  }, [queues, searchValues, filters]);

  const unjoinedFilteredQueues = useMemo(
    () =>
      filteredQueues.filter(
        (queue) => getJoinQueueId(queue) !== null && !isCompanyQueueJoined(queue)
      ),
    [filteredQueues, joinedQueueIds]
  );

  const allFilteredSelected = useMemo(() => {
    if (unjoinedFilteredQueues.length === 0) return false;
    return unjoinedFilteredQueues.every((q) => {
      const joinQueueId = getJoinQueueId(q);
      return joinQueueId !== null && selectedQueues.has(joinQueueId);
    });
  }, [unjoinedFilteredQueues, selectedQueues]);

  const toggleSelectAllInCity = () => {
    if (queueVerificationError) {
      setJoinError(queueVerificationError);
      return;
    }

    const next = new Set(selectedQueues);
    if (allFilteredSelected) {
      unjoinedFilteredQueues.forEach((q) => {
        const joinQueueId = getJoinQueueId(q);
        if (joinQueueId) next.delete(joinQueueId);
      });
    } else {
      unjoinedFilteredQueues.forEach((q) => {
        const joinQueueId = getJoinQueueId(q);
        if (joinQueueId) next.add(joinQueueId);
      });
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
    "grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 2xl:grid-cols-3";

  const updateCityInUrl = (city: string | null) => {
    const nextUrl = city
      ? `/all-queues?city=${encodeURIComponent(city)}`
      : "/all-queues";
    router.replace(localizedHref(nextUrl), { scroll: false });
  };

  const handleJoinSelectedQueues = async () => {
    if (!user) {
      router.push(localizedHref("/login"));
      return;
    }

    if (queueVerificationError) {
      setJoinError(queueVerificationError);
      return;
    }

    const queueIdsToJoin = Array.from(selectedQueues).filter(
      (queueId) => !joinedQueueIds.has(queueId)
    );

    if (queueIdsToJoin.length === 0) {
      setSelectedQueues(new Set());
      return;
    }

    setJoiningSelectedQueues(true);
    setJoinError(null);

    try {
      // Each mutateAsync triggers a my-queues invalidation via the hook's
      // onSettled. Promise.allSettled coalesces results so a single failure
      // doesn't block reporting the rest. The joinedQueueIds derivation
      // upstream picks up the new state once my-queues refetches.
      const results = await Promise.allSettled(
        queueIdsToJoin.map((queueId) => joinQueue.mutateAsync(queueId))
      );
      const joinedIds = queueIdsToJoin.filter(
        (_queueId, index) => results[index]?.status === "fulfilled"
      );
      const failedCount = results.length - joinedIds.length;

      if (joinedIds.length > 0) {
        // Deselect the queues we just joined. joinedQueueIds itself will
        // update reactively when the my-queues cache invalidation lands.
        setSelectedQueues((current) => {
          const next = new Set(current);
          joinedIds.forEach((queueId) => next.delete(queueId));
          return next;
        });
      }

      if (failedCount > 0) {
        setJoinError(
          failedCount === 1
            ? t("allQueues.failedJoinOne")
            : t("allQueues.failedJoinMany", { count: failedCount })
        );
      }
    } finally {
      setJoiningSelectedQueues(false);
    }
  };

  const renderQueueCard = (queue: CompanyQueueCard) => {
    const logoUrl = queue.logoUrl ?? null;
    const joinQueueId = getJoinQueueId(queue);
    const isAlreadyJoined = isCompanyQueueJoined(queue);
    const isJoinStatusLoading = authLoading || myQueuesLoading;

    const queueCardProps = {
      ...queue,
      area: "",
      city: (queue.cities ?? []).join(", "),
      totalUnits: undefined,
      unitsLabel: undefined,
      logoUrl,
      tags: [],
      logoAlt: t("allQueues.logoAlt", { name: queue.name }),
    };

    return (
      <div key={queue.id} className="flex h-full min-w-0 w-full">
        <Que_ListingCard
          name={queueCardProps.name}
          area={queueCardProps.area}
          city={queueCardProps.city}
          totalUnits={queueCardProps.totalUnits}
          unitsLabel={queueCardProps.unitsLabel}
          logoUrl={queueCardProps.logoUrl}
          logoAlt={queueCardProps.logoAlt}
          description={queue.subtitle ?? queue.description}
          termsUrl={queue.termsUrl}
          privacyUrl={queue.privacyUrl}
          tags={queueCardProps.tags}
          isSelected={
            joinQueueId !== null &&
            selectedQueues.has(joinQueueId) &&
            !isAlreadyJoined
          }
          isAlreadyJoined={isAlreadyJoined}
          isJoinStatusLoading={isJoinStatusLoading}
          isJoinDisabled={Boolean(queueVerificationError)}
          joinDisabledLabel={t("allQueues.verificationRequired")}
          cardHref={localizedHref(`/all-queues/${queue.companyId}`)}
          onToggleSelect={() => {
            if (isAlreadyJoined || isJoinStatusLoading) return;
            if (queueVerificationError) {
              setJoinError(queueVerificationError);
              return;
            }
            if (joinQueueId === null) {
              setJoinError(t("allQueues.missingQueue"));
              return;
            }

            const next = new Set(selectedQueues);
            if (next.has(joinQueueId)) {
              next.delete(joinQueueId);
            } else {
              next.add(joinQueueId);
            }
            setJoinError(null);
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
        <section className="mt-4 w-full sm:mt-8">
          <div className="flex w-full flex-col gap-3 sm:gap-4">
            <div className="flex w-full flex-col items-stretch gap-2 sm:gap-3 md:flex-row md:items-center md:justify-center lg:grid lg:grid-cols-[1fr_minmax(0,680px)_1fr] xl:grid-cols-[1fr_minmax(0,760px)_1fr] 2xl:grid-cols-[1fr_minmax(0,840px)_1fr]">
              <div className="w-full md:max-w-[620px] md:flex-1 lg:col-start-2 lg:max-w-none">
                <form
                  className="flex h-11 w-full items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-4 pr-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] sm:h-12 sm:gap-3 sm:pl-5 xl:pl-6 xl:pr-2"
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
                    placeholder={t("allQueues.searchPlaceholder")}
                    className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45 sm:text-base"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      aria-label={t("allQueues.clearSearch")}
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
                    {t("allQueues.searchSubmit")}
                  </button>
                </form>
              </div>
              <div className="w-auto self-center md:shrink-0 lg:col-start-3 lg:justify-self-start">
                <QueueFilterButton
                  variant="ghost"
                  size="icon-lg"
                  title={t("allQueues.filterTitle")}
                  triggerLabel={t("allQueues.filterTrigger")}
                  className="h-10 w-auto min-w-0 rounded-full border-0 bg-transparent px-2 text-sm font-medium text-[#004225] shadow-none hover:bg-transparent sm:h-12 sm:text-base xl:h-14 [&_svg]:h-[18px] [&_svg]:w-[18px] sm:[&_svg]:h-5 sm:[&_svg]:w-5"
                  cities={cityFilterOptions}
                  cityCounts={cityCounts}
                  citySelectionMode="single"
                  statuses={[]}
                  initialState={filters}
                  onApply={(state) => {
                    const selectedCity = state.cities[0] ?? null;
                    setFilters({
                      ...defaultQueueFilterState,
                      cities: selectedCity ? [selectedCity] : [],
                    });
                    updateCityInUrl(selectedCity);
                  }}
                  onClear={() => {
                    setFilters({ ...defaultQueueFilterState });
                    updateCityInUrl(null);
                  }}
                />
              </div>
            </div>

          </div>
        </section>

        <section className="mt-4 w-full sm:mt-5">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
              <h2
                id="koer-heading"
                className="min-w-0 text-base font-semibold text-black sm:text-lg"
              >
                {loading && queues.length === 0
                  ? t("allQueues.loadingCompanies")
                  : t("allQueues.companyCount", {
                      count: totalQueues.toLocaleString(numberLocale),
                    })}
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
                        {t("allQueues.deselectAll")}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {t("allQueues.selectAllInCity", { city: filters.cities[0] })}
                      </>
                    )}
                  </button>
                )}
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
              {filters.cities.length === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ ...defaultQueueFilterState });
                    updateCityInUrl(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black sm:text-sm"
                >
                  <X className="h-3.5 w-3.5" />
                  {t("allQueues.clearCityFilter")}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-3 min-h-[400px] w-full sm:mt-4">
          <FieldSet className="w-full" aria-labelledby="koer-heading">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-800 sm:px-4 sm:text-sm">
                {error}
              </div>
            )}

            {joinError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-800 sm:px-4 sm:text-sm">
                {joinError}
              </div>
            )}

            {queueVerificationError && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900 sm:px-4 sm:text-sm">
                {queueVerificationError}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                {t("allQueues.loadingQueues")}
              </div>
            ) : filteredQueues.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 sm:py-20 sm:text-base">
                {t("allQueues.empty")}
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
                    {t("allQueues.loadMore")}
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
              {selectedQueues.size === 1
                ? t("allQueues.selectedSingular")
                : t("allQueues.selectedPlural")}
            </span>
            <div className="h-5 w-px bg-gray-200" />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setSelectedQueues(new Set())}
            >
              {t("allQueues.clearSelection")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="default"
              isLoading={joiningSelectedQueues}
              isDisabled={
                joiningSelectedQueues ||
                selectedQueues.size === 0 ||
                Boolean(queueVerificationError)
              }
              onClick={handleJoinSelectedQueues}
            >
              {t("allQueues.joinSelected")}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

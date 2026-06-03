"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QueueHero from "@/features/ads/components/QueueHero";
import QueueListings from "@/features/ads/components/QueueListings";
import ImageSlideshow from "@/features/ads/components/ImageSlideshow";
import CompanyMap from "@/features/ads/components/CompanyMap";
import {
  buildJoinedQueueIdSet,
  type CompanyDTO,
} from "@/features/queues/services/queue-service";
import {
  useCompanyListingsPage,
  useJoinQueue,
  useMyQueues,
  useQueueCompany,
  useQueuesByCompany,
} from "@/features/queues/hooks/useQueues";
import {
  useFavorites,
  useToggleFavorite,
} from "@/features/listings/hooks/useListings";
import {
  demographicsService,
  getClientDeviceType,
} from "@/features/analytics/services/demographics-service";
import { mediaService } from "@/features/media/services/media-service";
import { useCompanyPublicMedia } from "@/features/media/hooks/useMedia";
import { useAuth } from "@/context/AuthContext";
import { getApplicationVerificationError } from "@/lib/application-eligibility";
import { type ListingCardDTO } from "@/types/listing";
import { type HousingQueueDTO } from "@/types/queue";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMPANY_LISTINGS_PAGE_SIZE = 6;
const imageFilenamePattern = /\.(avif|gif|jpe?g|png|webp)$/i;

const uniqueListingsById = (items: ListingCardDTO[]) => {
  const byId = new Map<string, ListingCardDTO>();
  items.forEach((item) => {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  });
  return Array.from(byId.values());
};

const firstNonEmptyString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  return null;
};

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const companyIdRaw = params?.id;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [listingsPage, setListingsPage] = useState(1);
  const [joiningQueueId, setJoiningQueueId] = useState<string | null>(null);
  const companyViewDemographicsRecordedIds = useRef<Set<number>>(new Set());
  const listingQuickDemographicsRecordedIds = useRef<Set<string>>(new Set());
  const queueVerificationError = useMemo(
    () => getApplicationVerificationError(user, "queue"),
    [user]
  );

  // Resolve the parsed company id once so company, queues, listings, and media
  // requests all use the same normalized id.
  const companyIdNumber = useMemo(() => {
    if (!companyIdRaw) return null;
    const parsed = Number(companyIdRaw);
    return Number.isNaN(parsed) ? null : parsed;
  }, [companyIdRaw]);

  const invalidCompanyId = Boolean(companyIdRaw) && companyIdNumber === null;

  // Three independent queries that share companyId — TanStack runs them in
  // parallel (same as the old Promise.allSettled), but each caches on its
  // own and reuses cached values on navigation back to a previously-visited
  // company.
  const {
    data: company,
    isLoading: companyLoading,
    isFetched: companyFetched,
    isError: companyIsError,
  } = useQueueCompany(companyIdNumber);

  const { data: queuesData, isError: queuesIsError } =
    useQueuesByCompany(companyIdNumber);
  const queues = useMemo(
    () => (Array.isArray(queuesData) ? queuesData : []),
    [queuesData]
  );
  const queuesError = queuesIsError
    ? "Kunde inte ladda företagets köinformation."
    : null;

  // hasFetched mirrors the previous "we've made at least one attempt"
  // semantic — flips true on either success or error.
  const hasFetched = invalidCompanyId || companyFetched;
  const loading = !invalidCompanyId && companyLoading;
  const error = invalidCompanyId
    ? "Ogiltigt företags-ID."
    : companyIsError
    ? "Kunde inte ladda företagsinformation."
    : null;

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      companyIdNumber === null ||
      companyViewDemographicsRecordedIds.current.has(companyIdNumber)
    ) {
      return;
    }

    companyViewDemographicsRecordedIds.current.add(companyIdNumber);
    demographicsService
      .recordCompanyView(companyIdNumber, {
        deviceType: getClientDeviceType(),
        viewType: "DETAILED",
      })
      .catch((err) =>
        console.error("Kunde inte registrera f\u00f6retagsvisning:", err)
      );
  }, [authLoading, companyIdNumber, user]);

  // Listings query — keyed on (companyId, page, size), so paging back to a
  // previously-viewed page is instant from cache.
  const {
    data: listingsPageData,
    isLoading: listingsLoading,
    isError: listingsIsError,
  } = useCompanyListingsPage(
    companyIdNumber,
    listingsPage - 1,
    COMPANY_LISTINGS_PAGE_SIZE
  );
  const listings = useMemo<ListingCardDTO[]>(
    () => uniqueListingsById(listingsPageData?.content ?? []),
    [listingsPageData]
  );
  const listingsTotalPages = Math.max(1, listingsPageData?.totalPages ?? 1);
  const listingsTotalElements =
    listingsPageData?.totalElements ?? listings.length;
  const listingsError = listingsIsError
    ? "Kunde inte ladda företagets bostäder."
    : null;

  // Reset paging when the company changes. Cached listings stay in the
  // query layer — no manual reset needed.
  useEffect(() => {
    setListingsPage(1);
  }, [companyIdNumber]);

  // My queues for membership lookup. Non-hydrated, shared cache with
  // /alla-koer.
  const { data: myQueues, isLoading: joinedQueuesLoading } = useMyQueues({
    hydrated: false,
  });
  const joinedQueueIds = useMemo<Set<string>>(
    () => (user && myQueues ? buildJoinedQueueIdSet(myQueues) : new Set()),
    [user, myQueues]
  );

  // Favorites — same shared cache as every other page.
  const { data: favoritesData } = useFavorites();
  const favoriteIds = useMemo<Set<string>>(
    () => new Set((favoritesData ?? []).map((favorite) => favorite.id)),
    [favoritesData]
  );
  const toggleFavorite = useToggleFavorite();
  const joinQueueMutation = useJoinQueue();

  useEffect(() => {
    if (listingsPage > listingsTotalPages) {
      setListingsPage(listingsTotalPages);
    }
  }, [listingsPage, listingsTotalPages]);

  useEffect(() => {
    if (authLoading || !user || listings.length === 0) {
      return;
    }

    listings.forEach((listing) => {
      if (listingQuickDemographicsRecordedIds.current.has(listing.id)) {
        return;
      }

      listingQuickDemographicsRecordedIds.current.add(listing.id);
      demographicsService
        .recordListingView(listing.id, {
          deviceType: getClientDeviceType(),
          viewType: "QUICK",
          resultedInLike: favoriteIds.has(listing.id),
        })
        .catch((err) =>
          console.error("Kunde inte registrera annonsvisning:", err)
        );
    });
  }, [authLoading, favoriteIds, listings, user]);

  // Bygg ett HousingQueueDTO-liknande objekt från company-data för QueueHero
  const companyRecord = company as (CompanyDTO & Record<string, unknown>) | null;
  const companyName =
    firstNonEmptyString(
      companyRecord?.name,
      companyRecord?.companyName,
      companyRecord?.displayName,
    ) ?? "Okänt företag";

  const companyLogoUrl =
    firstNonEmptyString(
      companyRecord?.logoUrl,
      companyRecord?.logoURL,
      companyRecord?.logo,
      companyRecord?.logoImage,
    ) ?? "";
  const companyBannerUrl =
    firstNonEmptyString(
      companyRecord?.bannerUrl,
      companyRecord?.bannerURL,
      companyRecord?.banner,
      companyRecord?.bannerImage,
    ) ?? undefined;
  const resolvedCompanyId =
    typeof companyRecord?.companyId === "number"
      ? companyRecord.companyId
      : company?.id ?? companyIdNumber ?? 0;
  const companyWebsite =
    firstNonEmptyString(companyRecord?.websiteUrl, companyRecord?.website) ??
    undefined;

  const heroQueue: HousingQueueDTO = company
    ? {
        id: String(resolvedCompanyId),
        companyId: resolvedCompanyId,
        name: companyName,
        city: company.cities?.[0] ?? queues[0]?.city ?? "",
        logoUrl: companyLogoUrl,
        bannerUrl: companyBannerUrl,
        description: company.description ?? undefined,
        website: companyWebsite,
        activeListings: listingsTotalElements || listings.length,
        totalUnits: queues.reduce((sum, q) => sum + (q.totalUnits ?? 0), 0),
        waitDays:
          queues.length > 0
            ? Math.round(
                queues.reduce((sum, q) => sum + (q.waitDays ?? 0), 0) /
                  queues.length,
              )
            : undefined,
      }
    : {
        // Placeholder medan data laddas — sidan renderas ändå.
        // Show "Laddar..." only while we're actively fetching for the first
        // time. After at least one attempt has resolved (success or fail)
        // we know to fall back to "Okänt företag".
        id: companyIdRaw ?? "",
        companyId: 0,
        name: hasFetched ? "Okänt företag" : "Laddar...",
        city: "",
        logoUrl: "",
        activeListings: 0,
      };

  // Gallery — derived from the cached media list. Mapping filenames →
  // public URLs is cheap, no need for state.
  const { data: galleryFilenames } = useCompanyPublicMedia(companyIdNumber);
  const galleryImages = useMemo<string[]>(() => {
    if (companyIdNumber === null || !galleryFilenames) return [];
    return galleryFilenames
      .filter((filename) => imageFilenamePattern.test(filename))
      .map((filename) =>
        mediaService.companyPublicUrl(companyIdNumber, filename)
      );
  }, [companyIdNumber, galleryFilenames]);

  const mapListings = useMemo(
    () =>
      listings.filter(
        (listing) =>
          typeof listing.lat === "number" && typeof listing.lng === "number",
      ),
    [listings],
  );

  const handleJoinQueue = async (queueId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (queueVerificationError) {
      alert(queueVerificationError);
      return;
    }

    if (joinedQueueIds.has(queueId)) {
      return;
    }

    setJoiningQueueId(queueId);
    try {
      await joinQueueMutation.mutateAsync(queueId);
      // The hook's onSettled invalidates the my-queues cache, which is what
      // drives joinedQueueIds above. We don't need to patch local state.
      alert("Du står nu i kön!");
    } catch (err: any) {
      alert(
        err.message || "Kunde inte gå med i kön. Kanske står du redan i den?",
      );
    } finally {
      setJoiningQueueId(null);
    }
  };

  const handleFavoriteToggle = (id: string, isFav: boolean) => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Optimistic patch + rollback are handled inside useToggleFavorite via
    // the shared favorites cache. Demographics view recording is a separate
    // fire-and-forget side effect that we keep here.
    toggleFavorite.mutate({ listingId: id, nextIsFavorite: isFav });

    if (isFav) {
      demographicsService
        .recordListingView(id, {
          deviceType: getClientDeviceType(),
          viewType: "QUICK",
          resultedInLike: true,
        })
        .catch((err) =>
          console.error("Kunde inte registrera favoritdemografi:", err),
        );
    }
  };

  const handleListingPageChange = (nextPage: number) => {
    setListingsPage(nextPage);
    document
      .getElementById("company-listings")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (error) {
    return (
      <div className="py-20 text-center text-red-500 font-medium">{error}</div>
    );
  }

  return (
    <main className="container mx-auto min-h-screen max-w-6xl bg-white px-4 pb-12 pt-6 lg:pt-10">
      {/* Hero: banner, logo, company info, about */}
      <div className="w-full">
        <QueueHero queue={heroQueue} />
      </div>

      {/* Köer */}
      {queuesError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {queuesError}
        </div>
      )}

      {queues.length > 0 && (
        <div className="mt-10 w-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bostadsköer
          </h2>
          <div className="space-y-3">
            {queues.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{q.name}</p>
                  <p className="text-sm text-gray-500">
                    {q.city}
                    {q.waitDays != null && ` · ~${q.waitDays} dagars kötid`}
                    {q.totalUnits != null && ` · ${q.totalUnits} bostäder`}
                  </p>
                </div>
                <Button
                  onClick={() => handleJoinQueue(q.id)}
                  isDisabled={
                    authLoading ||
                    joinedQueuesLoading ||
                    joinedQueueIds.has(q.id) ||
                    joiningQueueId !== null ||
                    Boolean(queueVerificationError)
                  }
                  variant={joinedQueueIds.has(q.id) ? "secondary" : "default"}
                  size="sm"
                  className={`shrink-0 ${
                    joinedQueueIds.has(q.id)
                      ? "border-gray-200 bg-gray-100 text-gray-500 shadow-none"
                      : ""
                  }`}
                >
                  {joiningQueueId === q.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      {authLoading || joinedQueuesLoading
                        ? "Kontrollerar..."
                        : joinedQueueIds.has(q.id)
                        ? "Du står redan i kön"
                        : queueVerificationError
                        ? "Verifiering krävs"
                        : user
                          ? "Ställ dig i kön"
                          : "Logga in"}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {queueVerificationError && queues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {queueVerificationError}
        </div>
      )}

      {/* Image gallery */}
      {galleryImages.length > 0 && (
        <div className="mt-12 w-full">
          <ImageSlideshow
            images={galleryImages}
            title={companyName}
          />
        </div>
      )}

      {/* Map — visualises the company's listings */}
      {mapListings.length > 0 && (
        <div className="mt-12 w-full">
          <CompanyMap
            listings={mapListings}
            getIsFavorite={(id) => favoriteIds.has(id)}
            onFavoriteToggle={handleFavoriteToggle}
          />
        </div>
      )}

      {/* Listings section */}
      <div id="company-listings" className="mt-10 scroll-mt-24 w-full pb-4">
        {listingsError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {listingsError}
          </div>
        )}

        {listings.length > 0 ? (
          <QueueListings
            listings={listings}
            title="Våra bostäder"
            page={listingsPage}
            totalPages={listingsTotalPages}
            isLoading={listingsLoading}
            onPageChange={handleListingPageChange}
          />
        ) : listingsLoading ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            Hämtar bostäder...
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            Det finns inga lediga bostäder publicerade just nu.
          </div>
        )}
      </div>
    </main>
  );
}

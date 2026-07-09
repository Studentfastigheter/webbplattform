"use client";

import SafeImage from "@/components/shared/SafeImage";
import ListingCardSkeleton from "@/features/listings/components/ListingCardSkeleton";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import QueueHero from "@/features/ads/components/QueueHero";
import QueueListings from "@/features/ads/components/QueueListings";
import CompanyMap from "@/features/ads/components/CompanyMap";
import ImageSlideshow from "@/features/ads/components/ImageSlideshow";
import CompanyVideoSection, {
  type CompanyVideo,
} from "@/features/ads/components/CompanyVideoSection";
import {
  buildJoinedQueueIdSet,
  type CompanyDTO,
} from "@/features/queues/services/queue-service";
import {
  useCompanyListingsComplete,
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
  canRecordDemographicsForUser,
  demographicsService,
  getClientDeviceType,
  ignoreDemographicsRecordError,
} from "@/features/analytics/services/demographics-service";
import { cityRefLabel } from "@/features/cities/city-utils";
import type { Locale } from "@/i18n/config";
import type { CityRef } from "@/types/city";
import { useAuth } from "@/context/AuthContext";
import { getApplicationVerificationError } from "@/lib/application-eligibility";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getYouTubeVideoId,
} from "@/lib/youtube-url";
import { type ListingCardDTO } from "@/types/listing";
import { type HousingQueueDTO } from "@/types/queue";
import { Bell, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const COMPANY_LISTINGS_PAGE_SIZE = 6;

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

const getExternalLink = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const normalizeUrlList = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    if (typeof value !== "string") return;
    const normalized = getExternalLink(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });

  return result;
};

const toCompanyVideo = (url: string): CompanyVideo | null => {
  const youtubeId = getYouTubeVideoId(url);
  if (!youtubeId) return null;

  return {
    originalUrl: url,
    embedUrl: getYouTubeEmbedUrl(youtubeId),
    thumbnailUrl: getYouTubeThumbnailUrl(youtubeId),
  };
};

function CompanyImageBoard({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const { locale } = useI18n();

  if (images.length === 0) return null;

  return (
    <section
      className="w-full"
      aria-label={localizedText(locale, "Bildgalleri", "Image gallery")}
    >
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <SafeImage
            key={`${image}-${index}`}
            src={image}
            alt={localizedText(
              locale,
              `${title} - bild ${index + 1}`,
              `${title} - image ${index + 1}`
            )}
            width={1200}
            height={800}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="mb-4 block h-auto w-full break-inside-avoid rounded-xl"
          />
        ))}
      </div>
    </section>
  );
}

const uniqueCityLabels = (values: CityRef[]) => {
  const labels = new Map<string, string>();

  values.forEach((ref) => {
    const label = cityRefLabel(ref);
    if (!label) return;
    labels.set(label.toLocaleLowerCase("sv-SE"), label);
  });

  return Array.from(labels.values());
};

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const companyIdRaw = params?.id;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { locale, localizedHref, t } = useI18n();

  const [listingsPage, setListingsPage] = useState(1);
  const [joiningQueueId, setJoiningQueueId] = useState<string | null>(null);
  const companyViewDemographicsRecordedIds = useRef<Set<number>>(new Set());
  const listingQuickDemographicsRecordedIds = useRef<Set<string>>(new Set());
  const queueVerificationError = useMemo(
    () => getApplicationVerificationError(user, "queue", locale),
    [locale, user]
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
    ? localizedText(locale, "Kunde inte ladda företagets köinformation.", "Could not load the company's queue information.")
    : null;

  // hasFetched mirrors the previous "we've made at least one attempt"
  // semantic — flips true on either success or error.
  const hasFetched = invalidCompanyId || companyFetched;
  const loading = !invalidCompanyId && companyLoading;
  const error = invalidCompanyId
    ? localizedText(locale, "Ogiltigt företags-ID.", "Invalid company ID.")
    : companyIsError
    ? localizedText(locale, "Kunde inte ladda företagsinformation.", "Could not load company information.")
    : null;

  useEffect(() => {
    if (
      authLoading ||
      !canRecordDemographicsForUser(user) ||
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
      .catch(ignoreDemographicsRecordError);
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
    ? localizedText(locale, "Kunde inte ladda företagets bostäder.", "Could not load the company's homes.")
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
    if (
      authLoading ||
      !canRecordDemographicsForUser(user) ||
      listings.length === 0
    ) {
      return;
    }

    listings.forEach((listing) => {
      if (listingQuickDemographicsRecordedIds.current.has(listing.id)) {
        return;
      }

      listingQuickDemographicsRecordedIds.current.add(listing.id);
      demographicsService
        .recordListingViewWithCompanyScope(companyIdNumber, listing.id, {
          deviceType: getClientDeviceType(),
          viewType: "QUICK",
          resultedInLike: favoriteIds.has(listing.id),
        })
        .catch(ignoreDemographicsRecordError);
    });
  }, [authLoading, companyIdNumber, favoriteIds, listings, user]);

  // Bygg ett HousingQueueDTO-liknande objekt från company-data för QueueHero
  const companyRecord = company as (CompanyDTO & Record<string, unknown>) | null;
  const companyName =
    firstNonEmptyString(
      companyRecord?.name,
      companyRecord?.companyName,
      companyRecord?.displayName,
    ) ?? localizedText(locale, "Okänt företag", "Unknown company");

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
  const companyContactPhone =
    firstNonEmptyString(companyRecord?.contactPhone, companyRecord?.phone) ??
    undefined;
  const companyContactEmail =
    firstNonEmptyString(companyRecord?.contactEmail, companyRecord?.email) ??
    undefined;
  const companyCities = uniqueCityLabels(company?.cities ?? []);
  const companyCitiesLabel = companyCities.join(", ");
  const companyTermsUrl = getExternalLink(
    firstNonEmptyString(companyRecord?.termsUrl)
  );
  const companyPrivacyUrl = getExternalLink(
    firstNonEmptyString(companyRecord?.privacyPolicyUrl, companyRecord?.privacyUrl)
  );
  const companyPolicyLinks = [
    { label: t("queueCard.terms"), href: companyTermsUrl },
    {
      label: t("queueCard.privacy"),
      href: companyPrivacyUrl,
    },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  const heroQueue: HousingQueueDTO = company
    ? {
        id: String(resolvedCompanyId),
        companyId: resolvedCompanyId,
        name: companyName,
        city: companyCitiesLabel,
        companyLogoUrl,
        logoUrl: companyLogoUrl,
        bannerUrl: companyBannerUrl,
        description: company.description ?? undefined,
        website: companyWebsite,
        contactPhone: companyContactPhone,
        contactEmail: companyContactEmail,
        socialLinks: company.socialLinks,
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
        name: hasFetched
          ? localizedText(locale, "Okänt företag", "Unknown company")
          : localizedText(locale, "Laddar...", "Loading..."),
        city: "",
        logoUrl: "",
        activeListings: 0,
      };

  // Gallery uses the saved company profile list so portal edits control what is shown publicly.
  const galleryImages = useMemo<string[]>(() => {
    return normalizeUrlList(company?.pictureUrlList);
  }, [company?.pictureUrlList]);
  const companyVideos = useMemo<CompanyVideo[]>(() => {
    const videoUrls = normalizeUrlList(company?.videoUrlList);

    return videoUrls
      .map(toCompanyVideo)
      .filter((video): video is CompanyVideo => video !== null);
  }, [company?.videoUrlList]);

  // The map shows every published listing for the company — not just the
  // 6 currently visible in the paginated grid below.
  const { data: allListingsData } = useCompanyListingsComplete(companyIdNumber);
  const mapListings = useMemo(
    () =>
      uniqueListingsById(allListingsData ?? []).filter(
        (listing) =>
          typeof listing.lat === "number" && typeof listing.lng === "number",
      ),
    [allListingsData],
  );
  const queueToJoin = queues[0] ?? null;

  const handleJoinQueue = async (queueId: string) => {
    if (!user) {
      router.push(localizedHref("/login"));
      return;
    }

    if (queueVerificationError) {
      toast.error(queueVerificationError);
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
      toast.success(localizedText(locale, "Du står nu i kön!", "You are now in the queue!"));
    } catch (err: any) {
      toast.error(
        err.message ||
          localizedText(
            locale,
            "Kunde inte gå med i kön. Kanske står du redan i den?",
            "Could not join the queue. You may already be in it.",
          ),
      );
    } finally {
      setJoiningQueueId(null);
    }
  };

  const handleFavoriteToggle = (id: string, isFav: boolean) => {
    if (!user) {
      router.push(localizedHref("/login"));
      return;
    }

    // Optimistic patch + rollback are handled inside useToggleFavorite via
    // the shared favorites cache. Demographics view recording is a separate
    // fire-and-forget side effect that we keep here.
    toggleFavorite.mutate({ listingId: id, nextIsFavorite: isFav });

    if (isFav && canRecordDemographicsForUser(user)) {
      demographicsService
        .recordListingViewWithCompanyScope(companyIdNumber, id, {
          deviceType: getClientDeviceType(),
          viewType: "QUICK",
          resultedInLike: true,
        })
        .catch(ignoreDemographicsRecordError);
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
    <main className="container mx-auto min-h-screen bg-white px-3 pb-12 pt-4 sm:px-4 md:px-6 lg:px-8 lg:pt-10">
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

      {queueToJoin && (
        <div className="mt-8 flex w-full flex-col items-center gap-3 md:items-start">
          <Button
            onClick={() => handleJoinQueue(queueToJoin.id)}
            isDisabled={
              authLoading ||
              joinedQueuesLoading ||
              joinedQueueIds.has(queueToJoin.id) ||
              joiningQueueId !== null ||
              Boolean(queueVerificationError)
            }
            variant={joinedQueueIds.has(queueToJoin.id) ? "secondary" : "default"}
            size="lg"
            className={`h-auto min-h-9 w-full min-w-0 shrink-0 whitespace-normal rounded-full px-4 py-2 text-center text-sm font-semibold leading-tight shadow-[0_6px_14px_rgba(0,0,0,0.18)] md:w-auto md:min-w-[180px] ${
              joinedQueueIds.has(queueToJoin.id)
                ? "border-gray-200 bg-gray-100 text-gray-500 shadow-none"
                : ""
            }`}
          >
            {joiningQueueId === queueToJoin.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Bell className="h-4 w-4" />
                {authLoading || joinedQueuesLoading
                  ? localizedText(locale, "Kontrollerar...", "Checking...")
                  : joinedQueueIds.has(queueToJoin.id)
                  ? localizedText(
                      locale,
                      "Du står redan i kön",
                      "You are already in the queue"
                    )
                  : queueVerificationError
                  ? localizedText(locale, "Verifiering krävs", "Verification required")
                  : user
                  ? localizedText(locale, "Ställ dig i kön", "Join queue")
                  : localizedText(locale, "Logga in", "Log in")}
              </>
            )}
          </Button>
          {companyPolicyLinks.length > 0 ? (
            <nav
              aria-label={t("queueCard.policyAria", { name: companyName })}
              className="flex min-h-[17px] w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 overflow-hidden text-center text-[13px] font-medium leading-[17px] text-brand md:w-auto md:justify-start md:text-left"
            >
              {companyPolicyLinks.map((link, index) => (
                <span key={link.label} className="inline-flex items-center gap-x-4">
                  {index > 0 && (
                    <span className="hidden h-5 w-px bg-brand/70 sm:block" />
                  )}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                  >
                    {link.label}
                  </a>
                </span>
              ))}
            </nav>
          ) : null}
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
          <div className="md:hidden">
            <ImageSlideshow images={galleryImages} title={companyName} />
          </div>
          <div className="hidden md:block">
            <CompanyImageBoard
              images={galleryImages}
              title={companyName}
            />
          </div>
        </div>
      )}

      {companyVideos.length > 0 && (
        <div className="mt-12 w-full">
          <CompanyVideoSection
            videos={companyVideos}
            companyName={companyName}
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
            title={localizedText(
              locale,
              `Lediga bostäder hos ${companyName}`,
              `Available homes at ${companyName}`
            )}
            page={listingsPage}
            totalPages={listingsTotalPages}
            isLoading={listingsLoading}
            onPageChange={handleListingPageChange}
          />
        ) : listingsLoading ? (
          <div
            className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 2xl:grid-cols-3"
            aria-busy="true"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <div key={`listing-skeleton-${index}`} className="flex w-full justify-center">
                <ListingCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            {localizedText(locale, "Det finns inga lediga bostäder publicerade just nu.", "There are no available homes published right now.")}
          </div>
        )}
      </div>
    </main>
  );
}

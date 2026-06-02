"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QueueHero from "@/features/ads/components/QueueHero";
import QueueListings from "@/features/ads/components/QueueListings";
import ImageSlideshow from "@/features/ads/components/ImageSlideshow";
import CompanyMap from "@/features/ads/components/CompanyMap";
import {
  buildJoinedQueueIdSet,
  queueService,
  type CompanyDTO,
} from "@/features/queues/services/queue-service";
import { listingService } from "@/features/listings/services/listing-service";
import {
  demographicsService,
  getClientDeviceType,
} from "@/features/analytics/services/demographics-service";
import { mediaService } from "@/features/media/services/media-service";
import { formatCityName } from "@/features/cities/city-utils";
import { useAuth } from "@/context/AuthContext";
import { getApplicationVerificationError } from "@/lib/application-eligibility";
import { type ListingCardDTO } from "@/types/listing";
import { type HousingQueueDTO } from "@/types/queue";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

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

const getExternalLink = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const uniqueCityLabels = (values: Array<string | null | undefined>) => {
  const labels = new Map<string, string>();

  values.forEach((value) => {
    const label = formatCityName(value?.replace(/_/g, " ") ?? "");
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

  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [queues, setQueues] = useState<HousingQueueDTO[]>([]);
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [listingsPage, setListingsPage] = useState(1);
  const [listingsTotalPages, setListingsTotalPages] = useState(1);
  const [listingsTotalElements, setListingsTotalElements] = useState(0);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [queuesError, setQueuesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Why true initially: avoids a flash of "Okänt företag" before the
  // effect has had a chance to start fetching on the very first render.
  const [loading, setLoading] = useState(true);
  // Why a separate flag: `loading` flips back to false on each refetch,
  // but we only want the "Laddar..." placeholder during the very first
  // load — once we've attempted at least once we know whether to show
  // the real name or the unknown-company fallback.
  const [hasFetched, setHasFetched] = useState(false);
  const [joiningQueueId, setJoiningQueueId] = useState<string | null>(null);
  const [joinedQueueIds, setJoinedQueueIds] = useState<Set<string>>(new Set());
  const [joinedQueuesLoading, setJoinedQueuesLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
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

  useEffect(() => {
    if (!companyIdRaw) return;
    if (companyIdNumber === null) {
      setError(localizedText(locale, "Ogiltigt företags-ID.", "Invalid company ID."));
      setLoading(false);
      setHasFetched(true);
      return;
    }

    let active = true;
    setLoading(true);
    setHasFetched(false);
    setError(null);
    setCompany(null);
    setQueues([]);
    setQueuesError(null);

    Promise.allSettled([
      queueService.getCompany(companyIdNumber),
      queueService.getByCompany(companyIdNumber),
    ])
      .then(([companyResult, queuesResult]) => {
        if (!active) return;

        if (companyResult.status === "fulfilled") {
          setCompany(companyResult.value);
        } else {
          console.error("Kunde inte hämta företaget:", companyResult.reason);
          setError(localizedText(locale, "Kunde inte ladda företagsinformation.", "Could not load company information."));
        }

        if (queuesResult.status === "fulfilled") {
          setQueues(Array.isArray(queuesResult.value) ? queuesResult.value : []);
          setQueuesError(null);
        } else {
          console.error("Kunde inte hämta företagets köer:", queuesResult.reason);
          setQueues([]);
          setQueuesError(localizedText(locale, "Kunde inte ladda företagets köinformation.", "Could not load the company's queue information."));
        }
      })
      .finally(() => {
        // Why no `active` guard here: we want loading/hasFetched to settle
        // even if the effect was cancelled by a remount in the meantime.
        // React 18+ no-ops sets on unmounted components, and the fresh
        // effect run will flip loading back to true synchronously, so
        // there's no spurious "not loading" flash.
        setLoading(false);
        setHasFetched(true);
      });

    return () => {
      active = false;
    };
  }, [companyIdRaw, companyIdNumber]);

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

  useEffect(() => {
    setListingsPage(1);
    setListings([]);
    setListingsTotalPages(1);
    setListingsTotalElements(0);
    setListingsError(null);
  }, [companyIdNumber]);

  useEffect(() => {
    if (companyIdNumber === null) {
      setListingsLoading(false);
      return;
    }

    let active = true;
    setListingsLoading(true);
    setListingsError(null);

    queueService
      .getCompanyListingsPage(
        companyIdNumber,
        listingsPage - 1,
        COMPANY_LISTINGS_PAGE_SIZE,
      )
      .then((page) => {
        if (!active) return;
        const uniqueListings = uniqueListingsById(page.content ?? []);
        setListings(uniqueListings);
        setListingsTotalPages(Math.max(1, page.totalPages ?? 1));
        setListingsTotalElements(page.totalElements ?? uniqueListings.length);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Kunde inte hämta företagets annonser:", err);
        setListings([]);
        setListingsTotalPages(1);
        setListingsTotalElements(0);
        setListingsError(localizedText(locale, "Kunde inte ladda företagets bostäder.", "Could not load the company's homes."));
      })
      .finally(() => {
        if (active) setListingsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [companyIdNumber, listingsPage]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setJoinedQueueIds(new Set());
      setJoinedQueuesLoading(false);
      return;
    }

    let active = true;
    setJoinedQueuesLoading(true);

    queueService
      .getMyQueues({ hydrateQueues: false })
      .then((applications) => {
        if (!active) return;
        setJoinedQueueIds(buildJoinedQueueIdSet(applications));
      })
      .catch((err) => {
        if (!active) return;
        console.error("Kunde inte hämta användarens köer:", err);
        setJoinedQueueIds(new Set());
      })
      .finally(() => {
        if (active) setJoinedQueuesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    let active = true;

    listingService
      .getFavorites()
      .then((favorites) => {
        if (!active) return;
        setFavoriteIds(new Set(favorites.map((favorite) => favorite.id)));
      })
      .catch((err) => {
        if (!active) return;
        console.error("Kunde inte hämta favoritannonser:", err);
        setFavoriteIds(new Set());
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

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
        logoUrl: companyLogoUrl,
        bannerUrl: companyBannerUrl,
        description: company.description ?? undefined,
        website: companyWebsite,
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

  useEffect(() => {
    if (companyIdNumber === null) {
      setGalleryImages([]);
      return;
    }

    let active = true;

    mediaService
      .listCompanyPublic(companyIdNumber)
      .then((filenames) => {
        if (!active) return;
        setGalleryImages(
          filenames
            .filter((filename) => imageFilenamePattern.test(filename))
            .map((filename) =>
              mediaService.companyPublicUrl(companyIdNumber, filename)
            )
        );
      })
      .catch((err) => {
        if (!active) return;
        console.error("Kunde inte hämta företagsmedia:", err);
        setGalleryImages([]);
      });

    return () => {
      active = false;
    };
  }, [companyIdNumber]);


  const mapListings = useMemo(
    () =>
      listings.filter(
        (listing) =>
          typeof listing.lat === "number" && typeof listing.lng === "number",
      ),
    [listings],
  );
  const queueToJoin = queues[0] ?? null;

  const handleJoinQueue = async (queueId: string) => {
    if (!user) {
      router.push(localizedHref("/login"));
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
      await queueService.join(queueId);
      setJoinedQueueIds((current) => new Set(current).add(queueId));
      alert(localizedText(locale, "Du står nu i kön!", "You are now in the queue!"));
    } catch (err: any) {
      alert(
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

    setFavoriteIds((current) => {
      const next = new Set(current);
      if (isFav) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

    const action = isFav
      ? listingService.addFavorite(id).then(() =>
          demographicsService
            .recordListingView(id, {
              deviceType: getClientDeviceType(),
              viewType: "QUICK",
              resultedInLike: true,
            })
            .catch((err) =>
              console.error("Kunde inte registrera favoritdemografi:", err)
            )
        )
      : listingService.removeFavorite(id);

    action.catch((err) => {
      console.error("Kunde inte uppdatera favoritannons:", err);
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (isFav) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    });
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
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {companyPolicyLinks.length > 0 ? (
            <nav
              aria-label={t("queueCard.policyAria", { name: companyName })}
              className="flex min-h-[17px] flex-wrap items-center gap-x-4 gap-y-1 overflow-hidden text-[13px] font-medium leading-[17px] text-[#004225]"
            >
              {companyPolicyLinks.map((link, index) => (
                <span key={link.label} className="inline-flex items-center gap-x-4">
                  {index > 0 && (
                    <span className="hidden h-5 w-px bg-[#004225]/70 sm:block" />
                  )}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm underline-offset-4 transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#004225]"
                  >
                    {link.label}
                  </a>
                </span>
              ))}
            </nav>
          ) : (
            <span className="hidden sm:block" />
          )}
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
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            {localizedText(locale, "Hämtar bostäder...", "Loading homes...")}
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

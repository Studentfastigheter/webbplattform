"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import ImageSlideshow from "@/components/ads/ImageSlideshow";
import CompanyMap from "@/components/ads/CompanyMap";
import {
  buildJoinedQueueIdSet,
  queueService,
  type CompanyDTO,
} from "@/services/queue-service";
import { listingService } from "@/services/listing-service";
import {
  demographicsService,
  getClientDeviceType,
} from "@/services/demographics-service";
import { mediaService } from "@/services/media-service";
import { useAuth } from "@/context/AuthContext";
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

  // Resolve the parsed company id once so we can drive both the fetch and
  // the dummy media lookup off the same number.
  const companyIdNumber = useMemo(() => {
    if (!companyIdRaw) return null;
    const parsed = Number(companyIdRaw);
    return Number.isNaN(parsed) ? null : parsed;
  }, [companyIdRaw]);

  useEffect(() => {
    if (!companyIdRaw) return;
    if (companyIdNumber === null) {
      setError("Ogiltigt företags-ID.");
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
          setError("Kunde inte ladda företagsinformation.");
        }

        if (queuesResult.status === "fulfilled") {
          setQueues(Array.isArray(queuesResult.value) ? queuesResult.value : []);
          setQueuesError(null);
        } else {
          console.error("Kunde inte hämta företagets köer:", queuesResult.reason);
          setQueues([]);
          setQueuesError("Kunde inte ladda företagets köinformation.");
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
        setListingsError("Kunde inte ladda företagets bostäder.");
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
    ) ?? "Okänt företag";

  const heroQueue: HousingQueueDTO = company
    ? {
        id: String(company.id),
        companyId: company.id,
        name: companyName,
        city: company.cities?.[0] ?? "",
        logoUrl: company.logoUrl ?? "",
        bannerUrl: company.bannerUrl ?? undefined,
        description: company.description ?? undefined,
        website: company.website ?? undefined,
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

  const handleJoinQueue = async (queueId: string) => {
    if (!user) {
      router.push("/logga-in");
      return;
    }

    if (joinedQueueIds.has(queueId)) {
      return;
    }

    setJoiningQueueId(queueId);
    try {
      await queueService.join(queueId);
      setJoinedQueueIds((current) => new Set(current).add(queueId));
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
      router.push("/logga-in");
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
                    joiningQueueId !== null
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

      {/* Image gallery */}
      {galleryImages.length > 0 && (
        <div className="mt-12 w-full">
          <ImageSlideshow
            images={galleryImages}
            title={company?.name ?? "Företaget"}
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

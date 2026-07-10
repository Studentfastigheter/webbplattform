"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import ListingCardFromDTO from "@/features/listings/components/ListingCardFromDTO";
import ListingCardSkeleton from "@/features/listings/components/ListingCardSkeleton";
import { listingService } from "@/features/listings/services/listing-service";
import type { ListingCardDTO } from "@/types/listing";
import { useI18n } from "@/i18n/I18nProvider";

const FEATURED_COUNT = 6;
const LOAD_ROOT_MARGIN = "600px 0px";

function randomSeed() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback för äldre webbläsare — behöver inte vara kryptografiskt stark.
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

export function FeaturedListings() {
  const { t, localizedHref } = useI18n();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [listings, setListings] = useState<ListingCardDTO[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // Lazy-ladda när sektionen närmar sig viewporten — samma mönster som
  // CityCarousel, så hero:t aldrig blockeras av ett annons-anrop vid sidladdning.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldLoad) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: LOAD_ROOT_MARGIN },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;

    let active = true;
    // Färsk seed per besök → backend blandar seed-stabilt och vi tar de 6
    // första. Varje ny sidladdning ger nya utvalda annonser.
    listingService
      .getAll({ seed: randomSeed(), page: 0, size: FEATURED_COUNT })
      .then((res) => {
        if (active) setListings(res.content ?? []);
      })
      .catch((error) => {
        if (!active) return;
        console.error(t("home.featuredListings.loadError"), error);
        setLoadFailed(true);
      });

    return () => {
      active = false;
    };
  }, [shouldLoad, t]);

  // Dölj sektionen helt om laddningen gav noll annonser eller misslyckades —
  // en tom "utvalda bostäder"-sektion på startsidan ser trasig ut.
  if (loadFailed || (listings !== null && listings.length === 0)) {
    return null;
  }

  const isLoadingListings = listings === null;

  return (
    <section
      ref={sectionRef}
      className="landing-deferred-section relative bg-background px-4 py-14 sm:px-6 sm:py-20 lg:py-24"
      aria-labelledby="featured-listings-heading"
      aria-busy={isLoadingListings}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 text-center sm:mb-10">
          <h2
            id="featured-listings-heading"
            className="text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl"
          >
            {t("home.featuredListings.heading")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t("home.featuredListings.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {isLoadingListings
            ? Array.from({ length: FEATURED_COUNT }, (_, index) => (
                <ListingCardSkeleton key={`featured-skeleton-${index}`} />
              ))
            : listings.map((listing) => (
                <ListingCardFromDTO
                  key={listing.id}
                  listing={listing}
                  showFavoriteButton={false}
                  onOpen={(id) => router.push(localizedHref(`/housing/${id}`))}
                />
              ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Button
            as={Link}
            href="/housing"
            variant="default"
            className="rounded-full px-8"
          >
            {t("home.featuredListings.viewAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}

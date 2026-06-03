"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import {
  formatCityName,
  getCityDescription,
  getCityImageUrl,
} from "@/features/cities/city-utils";
import SimpleCompanyCard from "@/features/cities/components/SimpleCompanyCard";
import Que_ListingCard from "@/features/listings/components/Que_ListingCard";
import ListingCardFromDTO from "@/features/listings/components/ListingCardFromDTO";
import {
  useFavorites,
  useListingsSearch,
  useToggleFavorite,
} from "@/features/listings/hooks/useListings";
import { useCompanies } from "@/features/companies/hooks/useCompanies";

const ListingsMap = dynamic(() => import("@/components/shared/map/ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-3xl bg-gray-100" />
  ),
});

const linkButtonClassName =
  "inline-flex h-9 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-semibold text-[#004225] transition-colors hover:bg-[#004225]/5";

const decodeRouteParam = (value: string | undefined) => {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default function CityDetailPage() {
  const params = useParams<{ stad: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const cityName = formatCityName(decodeRouteParam(params?.stad)) || "Stad";

  // Server state: each hook caches independently. Navigating between cities
  // reuses the cities-listing cache; the per-city listing search is keyed
  // by city + page + size.
  const {
    data: listingsPage,
    isLoading: listingsLoading,
    isError: isListingsError,
  } = useListingsSearch({ city: cityName, page: 0, size: 6 });
  const listings = listingsPage?.content ?? [];
  const listingsError = isListingsError
    ? "Kunde inte ladda bostäder i staden."
    : null;

  const {
    data: companies = [],
    isLoading: companiesLoading,
    isError: isCompaniesError,
  } = useCompanies();
  const companiesError = isCompaniesError ? "Kunde inte ladda företag." : null;

  // Favorites: shared with all other pages — same cache entry, no re-fetch
  // unless stale.
  const { data: favoritesData } = useFavorites();
  const favoriteIds = useMemo(
    () => new Set((favoritesData ?? []).map((listing) => listing.id)),
    [favoritesData],
  );
  const toggleFavorite = useToggleFavorite();

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Optimistic patch + rollback are handled inside useToggleFavorite.
    toggleFavorite.mutate({ listingId: id, nextIsFavorite: isFavorite });
  };

  return (
    <main className="flex h-auto w-full flex-col gap-6 pb-12 pt-4 sm:gap-8">
      <div className="container mx-auto h-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <section className="mt-6 w-full sm:mt-10">
          <div
            className="relative w-full overflow-hidden rounded-2xl bg-gray-100"
            style={{ aspectRatio: "1440 / 425" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url("${getCityImageUrl(cityName)}")`,
              }}
              aria-hidden
            />
          </div>

          <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-10">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {cityName}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {getCityDescription(cityName)}
            </p>
          </div>
        </section>

        <section className="mt-12 w-full">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Bostäder i {cityName}
            </h2>
            <Link
              href={`/bostader?city=${encodeURIComponent(cityName)}&page=1`}
              className={linkButtonClassName}
            >
              Fler bostäder
            </Link>
          </div>

          {listingsError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {listingsError}
            </div>
          )}

          {listingsLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Hämtar bostäder...
            </div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Inga bostäder hittades i {cityName} just nu.
            </div>
          ) : (
            <div className="grid grid-cols-1 justify-items-center gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {listings.map((listing) => (
                <div key={listing.id} className="flex w-full justify-center">
                  <ListingCardFromDTO
                    listing={listing}
                    isFavorite={favoriteIds.has(listing.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onOpen={(id) => router.push(`/bostader/${id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 w-full">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Karta
          </h2>
          <div className="relative isolate z-0 h-[70vh] min-h-[520px] max-h-[860px] w-full overflow-hidden rounded-3xl border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <ListingsMap
              listings={listings}
              className="h-full w-full"
              fillContainer
              getIsFavorite={(id) => favoriteIds.has(id)}
              onFavoriteToggle={handleFavoriteToggle}
              onOpenListing={(id) => router.push(`/bostader/${id}`)}
            />
          </div>
        </section>

        <section className="mt-12 w-full">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Företag
            </h2>
            <Link href="/alla-koer" className={linkButtonClassName}>
              Fler företag
            </Link>
          </div>

          {companiesError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {companiesError}
            </div>
          )}

          {companiesLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Hämtar företag...
            </div>
          ) : companies.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Inga företag hittades just nu.
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
              {companies.map((company) => {
                const cities = Array.isArray(company.cities)
                  ? company.cities.map(formatCityName).filter(Boolean)
                  : [];

                return (
                  <div key={company.id} className="flex h-full min-w-0 w-full">
                    <Que_ListingCard
                      name={company.name}
                      area=""
                      city={cities.join(", ")}
                      logoUrl={company.logoUrl || "/logos/campuslyan-logo.svg"}
                      logoAlt={`${company.name} logotyp`}
                      description={company.description ?? company.subtitle}
                      termsUrl={company.termsUrl}
                      privacyUrl={company.privacyUrl}
                      tags={[]}
                      isJoinDisabled
                      joinDisabledLabel="Visa kö"
                      onViewListings={() =>
                        router.push(`/alla-koer/${company.id}`)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12 w-full">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Andra företag
          </h2>

          {companiesError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {companiesError}
            </div>
          )}

          {companiesLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Hämtar företag...
            </div>
          ) : companies.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Inga andra företag hittades just nu.
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
              {companies.map((company) => (
                <SimpleCompanyCard key={company.id} company={company} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

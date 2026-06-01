"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";

import { LocalizedLink } from "@/components/i18n/LocalizedLink";
import { useAuth } from "@/context/AuthContext";
import {
  formatCityName,
  getCityImageUrl,
} from "@/features/cities/city-utils";
import SimpleCompanyCard from "@/features/cities/components/SimpleCompanyCard";
import { cityService, normalizeCityCode } from "@/features/cities/services/city-service";
import type { CompanyPublicDTO } from "@/features/companies/services/company-service";
import Que_ListingCard from "@/features/listings/components/Que_ListingCard";
import ListingCardFromDTO from "@/features/listings/components/ListingCardFromDTO";
import { listingService } from "@/features/listings/services/listing-service";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import type { CityCompanyDTO, CityDetailedDTO } from "@/types/city";
import type { ListingCardDTO } from "@/types/listing";

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

const cityCompanyToPublicCompany = (
  company: CityCompanyDTO,
  cityName: string
): CompanyPublicDTO | null => {
  if (typeof company.id !== "number" || !company.name?.trim()) {
    return null;
  }

  return {
    id: company.id,
    name: company.name.trim(),
    subtitle: company.subtitle ?? null,
    description: company.description ?? company.subtitle ?? null,
    websiteUrl: company.websiteUrl ?? null,
    logoUrl: company.logoUrl ?? null,
    bannerUrl: company.bannerUrl ?? null,
    cities: [cityName],
  };
};

export default function CityDetailPage() {
  const params = useParams<{ city: string }>();
  const router = useRouter();
  const { locale, localizedHref } = useI18n();
  const { user } = useAuth();
  const routeCity = decodeRouteParam(params?.city);
  const fallbackCityName = formatCityName(routeCity) || localizedText(locale, "Stad", "City");
  const [cityDetail, setCityDetail] = useState<CityDetailedDTO | null>(null);
  const cityName = formatCityName(cityDetail?.city ?? fallbackCityName) || fallbackCityName;
  const cityDescription = cityDetail?.description?.trim() || "";
  const cityBannerUrl = cityDetail?.bannerUrl?.trim() || getCityImageUrl(cityName);
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [companies, setCompanies] = useState<CompanyPublicDTO[]>([]);
  const [externalCompanies, setExternalCompanies] = useState<CompanyPublicDTO[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setListingsLoading(true);
    setListingsError(null);

    listingService
      .getAll({
        city: cityName,
        page: 0,
        size: 6,
      })
      .then((res) => {
        if (active) setListings(res.content ?? []);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setListings([]);
        setListingsError(localizedText(locale, "Kunde inte ladda bostäder i staden.", "Could not load homes in the city."));
      })
      .finally(() => {
        if (active) setListingsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cityName, locale]);

  useEffect(() => {
    let active = true;
    setCompaniesLoading(true);
    setCompaniesError(null);

    cityService
      .get(normalizeCityCode(routeCity || fallbackCityName))
      .then((detail) => {
        if (!active) return;

        const nextCityName = formatCityName(detail.city ?? fallbackCityName) || fallbackCityName;
        setCityDetail(detail);
        setCompanies(
          (detail.companies ?? [])
            .map((company) => cityCompanyToPublicCompany(company, nextCityName))
            .filter((company): company is CompanyPublicDTO => company !== null)
        );
        setExternalCompanies(
          (detail.externalCompanies ?? [])
            .map((company) => cityCompanyToPublicCompany(company, nextCityName))
            .filter((company): company is CompanyPublicDTO => company !== null)
        );
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setCityDetail(null);
        setCompanies([]);
        setExternalCompanies([]);
        setCompaniesError(localizedText(locale, "Kunde inte ladda företag.", "Could not load companies."));
      })
      .finally(() => {
        if (active) setCompaniesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fallbackCityName, locale, routeCity]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    let active = true;

    listingService
      .getFavorites()
      .then((favorites) => {
        if (active) setFavoriteIds(new Set(favorites.map((listing) => listing.id)));
      })
      .catch((err) => {
        console.error("Could not load saved homes:", err);
        if (active) setFavoriteIds(new Set());
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    if (!user) {
      router.push(localizedHref("/login"));
      return;
    }

    setFavoriteIds((current) => {
      const next = new Set(current);
      if (isFavorite) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

    const action = isFavorite
      ? listingService.addFavorite(id)
      : listingService.removeFavorite(id);

    action.catch((err) => {
      console.error("Could not update saved home:", err);
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (isFavorite) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    });
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
                backgroundImage: `url("${cityBannerUrl}")`,
              }}
              aria-hidden
            />
          </div>

          <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-10">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {cityName}
            </h1>
            {cityDescription && (
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                {cityDescription}
              </p>
            )}
          </div>
        </section>

        <section className="mt-12 w-full">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {localizedText(locale, `Bostäder i ${cityName}`, `Homes in ${cityName}`)}
            </h2>
            <LocalizedLink
              href={`/housing?city=${encodeURIComponent(cityName)}&page=1`}
              className={linkButtonClassName}
            >
              {localizedText(locale, "Fler bostäder", "More homes")}
            </LocalizedLink>
          </div>

          {listingsError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {listingsError}
            </div>
          )}

          {listingsLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {localizedText(locale, "Hämtar bostäder...", "Loading homes...")}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {localizedText(locale, `Inga bostäder hittades i ${cityName} just nu.`, `No homes were found in ${cityName} right now.`)}
            </div>
          ) : (
            <div className="grid grid-cols-1 justify-items-center gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {listings.map((listing) => (
                <div key={listing.id} className="flex w-full justify-center">
                  <ListingCardFromDTO
                    listing={listing}
                    isFavorite={favoriteIds.has(listing.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onOpen={(id) => router.push(localizedHref(`/housing/${id}`))}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 w-full">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            {localizedText(locale, "Karta", "Map")}
          </h2>
          <div className="relative isolate z-0 h-[70vh] min-h-[520px] max-h-[860px] w-full overflow-hidden rounded-3xl border border-black/5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <ListingsMap
              listings={listings}
              className="h-full w-full"
              fillContainer
              getIsFavorite={(id) => favoriteIds.has(id)}
              onFavoriteToggle={handleFavoriteToggle}
              onOpenListing={(id) => router.push(localizedHref(`/housing/${id}`))}
            />
          </div>
        </section>

        <section className="mt-12 w-full">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {localizedText(locale, "Företag", "Companies")}
            </h2>
            <LocalizedLink
              href={`/all-queues?city=${encodeURIComponent(cityName)}`}
              className={linkButtonClassName}
            >
              {localizedText(locale, "Fler företag", "More companies")}
            </LocalizedLink>
          </div>

          {companiesError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {companiesError}
            </div>
          )}

          {companiesLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {localizedText(locale, "Hämtar företag...", "Loading companies...")}
            </div>
          ) : companies.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {localizedText(locale, "Inga företag hittades just nu.", "No companies were found right now.")}
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
                      logoAlt={localizedText(locale, `${company.name} logotyp`, `${company.name} logo`)}
                      description={company.description ?? company.subtitle}
                      termsUrl={company.termsUrl}
                      privacyUrl={company.privacyUrl}
                      tags={[]}
                      isJoinDisabled
                      joinDisabledLabel={localizedText(locale, "Visa kö", "View queue")}
                      onViewListings={() =>
                        router.push(localizedHref(`/all-queues/${company.id}`))
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
            {localizedText(locale, "Andra företag", "Other companies")}
          </h2>

          {companiesError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {companiesError}
            </div>
          )}

          {companiesLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {localizedText(locale, "Hämtar företag...", "Loading companies...")}
            </div>
          ) : externalCompanies.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              {localizedText(locale, "Inga andra företag hittades just nu.", "No other companies were found right now.")}
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 justify-start gap-3 sm:grid-cols-[repeat(auto-fill,minmax(360px,380px))] sm:gap-5 lg:gap-6">
              {externalCompanies.map((company) => (
                <SimpleCompanyCard key={company.id} company={company} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

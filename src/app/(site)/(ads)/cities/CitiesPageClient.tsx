"use client";

import { useMemo, useState } from "react";

import CityCardMedia from "@/features/cities/components/CityCardMedia";
import { Skeleton } from "@/components/ui/skeleton";

import { LocalizedLink } from "@/components/i18n/LocalizedLink";
import { FieldSet } from "@/components/ui/field";
import { SearchBar } from "@/components/ui/search-bar";
import { cityCodeToUrlSegment, normalizeCityName } from "@/features/cities/city-utils";
import { useCitiesList } from "@/features/cities/hooks/useCities";
import { useI18n } from "@/i18n/I18nProvider";
import { formatLocalizedNumber, localizedCount, localizedText } from "@/i18n/text";
import { toSearchString } from "@/lib/utils";
import type { CityDTO } from "@/types/city";

type CityCardData = {
  name: string;
  code: string;
  imageUrl?: string | null;
  description?: string | null;
};

function CityCard({ city }: { city: CityCardData }) {
  const { locale } = useI18n();
  const name = city.name;
  // City page URLs use the lowercased English-derived code (/cities/gothenburg).
  const cityHref = `/cities/${encodeURIComponent(cityCodeToUrlSegment(city.code))}`;

  return (
    <LocalizedLink
      href={cityHref}
      aria-label={localizedText(locale, `Öppna ${name}`, `Open ${name}`)}
      className="group relative block h-[225px] w-full overflow-hidden rounded-[22px] border border-black/[0.06] bg-brand-25 shadow-[0_10px_26px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 sm:h-[245px]"
    >
      <CityCardMedia
        cityName={name}
        imageUrl={city.imageUrl}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      />
    </LocalizedLink>
  );
}

function normalizeCityCard(city: CityDTO): CityCardData | null {
  const name = normalizeCityName(city.name ?? city.code);
  if (!name) return null;

  const code = city.code?.trim() || name;
  const imageUrl = city.bannerUrl?.trim() || null;
  const description = city.description?.trim() || null;

  return {
    name,
    code,
    imageUrl,
    description,
  };
}

function uniqueCityCards(cities: CityCardData[]) {
  const byKey = new Map<string, CityCardData>();

  cities.forEach((city) => {
    const key = city.code || city.name;
    if (!byKey.has(key)) {
      byKey.set(key, city);
    }
  });

  return Array.from(byKey.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "sv-SE")
  );
}

export default function CitiesPage() {
  const { locale } = useI18n();
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const citiesQuery = useCitiesList();
  const cities = useMemo(
    () =>
      uniqueCityCards(
        (citiesQuery.data ?? [])
          .map(normalizeCityCard)
          .filter((city): city is CityCardData => city !== null)
      ),
    [citiesQuery.data]
  );
  const loading = citiesQuery.isLoading;
  const error = citiesQuery.isError
    ? localizedText(locale, "Kunde inte ladda städer.", "Could not load cities.")
    : null;
  const filteredCities = useMemo<CityCardData[]>(() => {
    const query = toSearchString(searchValue);

    return cities
      .filter((city) =>
        !query ||
        toSearchString(city.name).includes(query) ||
        toSearchString(city.code).includes(query) ||
        toSearchString(city.description ?? "").includes(query)
      );
  }, [cities, searchValue]);

  const totalCities = filteredCities.length;

  return (
    <main className="flex h-auto w-full flex-col gap-6 pb-12 pt-4 sm:gap-8">
      <div className="container mx-auto h-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <section className="mt-4 w-full sm:mt-8">
          <div className="flex w-full flex-col items-stretch gap-3 sm:gap-4 md:flex-row md:items-center md:justify-center lg:grid lg:grid-cols-[1fr_minmax(0,680px)_1fr] xl:grid-cols-[1fr_minmax(0,760px)_1fr] 2xl:grid-cols-[1fr_minmax(0,840px)_1fr]">
            <div className="w-full md:max-w-[620px] md:flex-1 lg:col-start-2 lg:max-w-none">
              <SearchBar
                value={searchInput}
                onValueChange={setSearchInput}
                placeholder={localizedText(locale, "Sök efter stad", "Search by city")}
                submitLabel={localizedText(locale, "Sök", "Search")}
                clearLabel={localizedText(locale, "Rensa sökning", "Clear search")}
                onClear={() => {
                  setSearchInput("");
                  setSearchValue("");
                }}
                onSubmit={(event) => {
                  event.preventDefault();
                  setSearchValue(searchInput);
                }}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 w-full sm:mt-8">
          <h2
            id="cities-heading"
            className="text-base font-semibold text-black sm:text-lg"
          >
            {loading && cities.length === 0
              ? localizedText(locale, "Laddar städer...", "Loading cities...")
              : localizedCount(locale, totalCities, "stad", "städer", "city", "cities").replace(
                  String(totalCities),
                  formatLocalizedNumber(locale, totalCities),
                )}
          </h2>
        </section>

        <section className="mt-4 min-h-[400px] w-full sm:mt-6">
          <FieldSet className="w-full" aria-labelledby="cities-heading">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-800 sm:px-4 sm:text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div
                className="grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3"
                aria-busy="true"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton
                    key={`city-skeleton-${index}`}
                    className="h-[225px] w-full rounded-[22px] motion-reduce:animate-none sm:h-[245px]"
                  />
                ))}
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 sm:py-20 sm:text-base">
                {localizedText(locale, "Inga städer matchade din sökning.", "No cities matched your search.")}
              </div>
            ) : (
              <div className="grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                {filteredCities.map((city) => (
                  <CityCard key={city.code} city={city} />
                ))}
              </div>
            )}
          </FieldSet>
        </section>
      </div>
    </main>
  );
}

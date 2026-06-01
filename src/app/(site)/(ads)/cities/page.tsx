"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { LocalizedLink } from "@/components/i18n/LocalizedLink";
import { FieldSet } from "@/components/ui/field";
import { getCityImageUrl, normalizeCityName } from "@/features/cities/city-utils";
import { cityService } from "@/features/cities/services/city-service";
import { useI18n } from "@/i18n/I18nProvider";
import { formatLocalizedNumber, localizedCount, localizedText } from "@/i18n/text";
import { toSearchString } from "@/lib/utils";
import type { CityDTO } from "@/types/city";

type CityCardData = {
  name: string;
  code: string;
  imageUrl: string;
  description?: string | null;
};

function CityCard({ city }: { city: CityCardData }) {
  const { locale } = useI18n();
  const cityHref = `/cities/${encodeURIComponent(city.code)}`;

  return (
    <LocalizedLink
      href={cityHref}
      aria-label={localizedText(locale, `Öppna ${city.name}`, `Open ${city.name}`)}
      className="group relative block h-[225px] w-full overflow-hidden rounded-[22px] border border-black/[0.06] bg-gray-200 shadow-[0_10px_26px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004225]/35 sm:h-[245px]"
      style={{
        backgroundImage: `url("${city.imageUrl}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/70 transition-opacity group-hover:opacity-95" />
      <span className="absolute bottom-5 left-5 right-5 block max-w-[calc(100%-2.5rem)] text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.42)] sm:bottom-6 sm:left-6 sm:right-6">
        <span className="break-words text-[25px] font-medium leading-[1.05] sm:text-[29px]">
          {city.name}
        </span>
      </span>
    </LocalizedLink>
  );
}

function normalizeCityCard(city: CityDTO): CityCardData | null {
  const name = normalizeCityName(city.city ?? city.code);
  if (!name) return null;

  const code = city.code?.trim() || name;
  const imageUrl = city.bannerUrl?.trim() || getCityImageUrl(name, "900x620");
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
  const [cities, setCities] = useState<CityCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    cityService
      .list()
      .then((cityResult) => {
        if (!active) return;
        setCities(
          uniqueCityCards(
            cityResult
              .map(normalizeCityCard)
              .filter((city): city is CityCardData => city !== null)
          )
        );
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError(localizedText(locale, "Kunde inte ladda städer.", "Could not load cities."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale]);

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
        <section className="mt-6 w-full sm:mt-12">
          <div className="flex w-full flex-col items-stretch gap-3 sm:gap-4 md:flex-row md:items-center md:justify-center lg:grid lg:grid-cols-[1fr_minmax(0,680px)_1fr] xl:grid-cols-[1fr_minmax(0,760px)_1fr] 2xl:grid-cols-[1fr_minmax(0,840px)_1fr]">
            <div className="w-full md:max-w-[620px] md:flex-1 lg:col-start-2 lg:max-w-none">
              <form
                className="flex h-11 w-full items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-4 pr-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.08)] sm:h-12 sm:gap-3 sm:pl-5 xl:h-14 xl:pl-6 xl:pr-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSearchValue(searchInput);
                }}
              >
                <Search className="h-[18px] w-[18px] shrink-0 text-black/55 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={localizedText(locale, "Sök efter stad", "Search by city")}
                  className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45 sm:text-base"
                />
                {searchInput && (
                  <button
                    type="button"
                    aria-label={localizedText(locale, "Rensa sökning", "Clear search")}
                    onClick={() => {
                      setSearchInput("");
                      setSearchValue("");
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
                  {localizedText(locale, "Sök", "Search")}
                </button>
              </form>
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
              <div className="py-12 text-center text-sm text-gray-500">
                {localizedText(locale, "Laddar städer...", "Loading cities...")}
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 sm:py-20 sm:text-base">
                {localizedText(locale, "Inga städer matchade din sökning.", "No cities matched your search.")}
              </div>
            ) : (
              <div className="grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
                {filteredCities.map((city) => (
                  <CityCard key={city.name} city={city} />
                ))}
              </div>
            )}
          </FieldSet>
        </section>
      </div>
    </main>
  );
}

"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import { getCityImageUrl, normalizeCityName } from "@/features/cities/city-utils";
import { cityService } from "@/features/cities/services/city-service";
import { isPlatformLaunched } from "@/lib/platform-launch";
import type { CityDTO } from "@/types/city";

const FALLBACK_CITIES = [
  "Göteborg",
  "Stockholm",
  "Lund",
  "Uppsala",
  "Linköping",
  "Malmö",
  "Örebro",
  "Umeå",
];

const MIN_CAROUSEL_DURATION_SECONDS = 80;
const CAROUSEL_DURATION_SECONDS_PER_CITY = 5;

type CityCarouselItem = {
  name: string;
  code: string;
  imageUrl: string;
};

function CityCarouselCard({
  city,
  platformLaunched,
}: {
  city: CityCarouselItem;
  platformLaunched: boolean;
}) {
  const { t } = useI18n();
  const cardClassName =
    "group relative block h-[330px] w-[230px] shrink-0 overflow-hidden rounded-[22px] bg-white ring-1 ring-black/[0.04] transition-transform duration-300 ease-out hover:-translate-y-3 focus-visible:-translate-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004225]/35 sm:h-[390px] sm:w-[280px] lg:h-[430px] lg:w-[320px]";
  const style = {
    backgroundImage: `url("${city.imageUrl}")`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
  const content = (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/72 transition-opacity group-hover:opacity-95" />
      <span className="absolute bottom-5 left-5 max-w-[calc(100%-2.5rem)] break-words text-[24px] font-medium leading-[1.05] text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.42)] sm:bottom-6 sm:left-6 sm:text-[28px]">
        {city.name}
      </span>
    </>
  );

  if (!platformLaunched) {
    return (
      <div className={cardClassName} style={style} aria-label={city.name}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/cities/${encodeURIComponent(city.code)}`}
      aria-label={t("home.cities.openAria", { city: city.name })}
      className={cardClassName}
      style={style}
    >
      {content}
    </Link>
  );
}

function normalizeCarouselCity(city: CityDTO): CityCarouselItem | null {
  const name = normalizeCityName(city.city ?? city.code);
  if (!name) return null;

  return {
    name,
    code: city.code?.trim() || name,
    imageUrl: city.bannerUrl?.trim() || getCityImageUrl(name, "720x980"),
  };
}

function fallbackCarouselCity(name: string): CityCarouselItem {
  const normalizedName = normalizeCityName(name);

  return {
    name: normalizedName,
    code: normalizedName,
    imageUrl: getCityImageUrl(normalizedName, "720x980"),
  };
}

function uniqueCarouselCities(cities: CityCarouselItem[]) {
  const byKey = new Map<string, CityCarouselItem>();

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

export function CityCarousel() {
  const { t } = useI18n();
  const platformLaunched = isPlatformLaunched();
  const [cities, setCities] = useState<CityCarouselItem[]>([]);

  useEffect(() => {
    if (!platformLaunched) {
      setCities([]);
      return;
    }

    let active = true;

    cityService
      .list()
      .then((cityResult) => {
        if (!active) return;

        const nextCities = uniqueCarouselCities(
          cityResult
            .map(normalizeCarouselCity)
            .filter((city): city is CityCarouselItem => city !== null)
        );

        if (nextCities.length > 0) {
          setCities(nextCities);
        }
      })
      .catch((err) => {
        console.error(t("home.cities.loadError"), err);
      });

    return () => {
      active = false;
    };
  }, [platformLaunched, t]);

  const displayCities =
    cities.length > 0
      ? cities
      : platformLaunched
        ? []
        : FALLBACK_CITIES.map(fallbackCarouselCity);
  const carouselCities = useMemo(
    () => [...displayCities, ...displayCities],
    [displayCities],
  );
  const carouselStyle = {
    "--landing-cities-duration": `${Math.max(
      MIN_CAROUSEL_DURATION_SECONDS,
      displayCities.length * CAROUSEL_DURATION_SECONDS_PER_CITY,
    )}s`,
  } as CSSProperties;

  return (
    <section className="py-14 sm:py-20 lg:py-24" aria-labelledby="city-carousel-heading">
      <h2
        id="city-carousel-heading"
        className="mx-auto mb-6 max-w-4xl px-4 text-center text-2xl font-bold leading-tight text-foreground sm:mb-8 sm:text-3xl md:text-4xl"
      >
        {t("home.cities.headingStart")}{" "}
        <span className="text-pop-contrast">{t("home.cities.headingHighlight")}</span>
      </h2>
      <div className="landing-cities-marquee">
        <div className="landing-cities-track" style={carouselStyle}>
          {carouselCities.map((city, index) => (
            <CityCarouselCard
              key={`${city.code}-${index}`}
              city={city}
              platformLaunched={platformLaunched}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

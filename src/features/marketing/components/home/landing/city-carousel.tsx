"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import CityCardMedia from "@/features/cities/components/CityCardMedia";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import { normalizeCityName } from "@/features/cities/city-utils";
import { cityService } from "@/features/cities/services/city-service";
import type { CityDTO } from "@/types/city";

const MIN_CAROUSEL_DURATION_SECONDS = 80;
const CAROUSEL_DURATION_SECONDS_PER_CITY = 5;
const CITY_LOAD_ROOT_MARGIN = "700px 0px";

type CityCarouselItem = {
  name: string;
  code: string;
  imageUrl?: string | null;
};

function CityCarouselCard({ city }: { city: CityCarouselItem }) {
  const { t } = useI18n();
  const cardClassName =
    "group relative block h-[330px] w-[230px] shrink-0 overflow-hidden rounded-[22px] bg-brand-25 ring-1 ring-black/[0.04] transition-transform duration-300 ease-out hover:-translate-y-3 focus-visible:-translate-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 sm:h-[390px] sm:w-[280px] lg:h-[430px] lg:w-[320px]";

  const content = (
    <CityCardMedia
      cityName={city.name}
      imageUrl={city.imageUrl}
      unoptimized
      sizes="(max-width: 640px) 230px, (max-width: 1024px) 280px, 320px"
      imageClassName="transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.03]"
    />
  );

  return (
    <Link
      href={`/cities/${encodeURIComponent(city.code)}`}
      aria-label={t("home.cities.openAria", { city: city.name })}
      className={cardClassName}
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
    imageUrl: city.bannerUrl?.trim() || null,
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
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [cities, setCities] = useState<CityCarouselItem[]>([]);

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
      { rootMargin: CITY_LOAD_ROOT_MARGIN },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) return;

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

        setCities(nextCities);
      })
      .catch((err) => {
        console.error(t("home.cities.loadError"), err);
      });

    return () => {
      active = false;
    };
  }, [shouldLoad, t]);

  const displayCities = cities;
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
    <section
      ref={sectionRef}
      className="landing-deferred-section py-14 sm:py-20 lg:py-24"
      aria-labelledby="city-carousel-heading"
    >
      <h2
        id="city-carousel-heading"
        className="mx-auto mb-6 max-w-4xl px-4 text-center text-2xl font-bold leading-tight text-foreground sm:mb-8 sm:text-3xl md:text-4xl"
      >
        {t("home.cities.headingStart")}{" "}
        <span className="text-pop-contrast">{t("home.cities.headingHighlight")}</span>
      </h2>
      <div className="landing-cities-marquee min-h-[362px] sm:min-h-[424px] lg:min-h-[464px]">
        <div className="landing-cities-track" style={carouselStyle}>
          {carouselCities.map((city, index) => (
            <CityCarouselCard
              key={`${city.code}-${index}`}
              city={city}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import { getCityImageUrl, normalizeCityName } from "@/features/cities/city-utils";
import { listingService } from "@/features/listings/services/listing-service";
import { isPlatformLaunched } from "@/lib/platform-launch";
import { uniqueOnly } from "@/lib/utils";

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

const MIN_CAROUSEL_DURATION_SECONDS = 520;
const CAROUSEL_DURATION_SECONDS_PER_CITY = 32;

function CityCarouselCard({
  city,
  platformLaunched,
}: {
  city: string;
  platformLaunched: boolean;
}) {
  const { t } = useI18n();
  const cardClassName =
    "group relative block h-[330px] w-[230px] shrink-0 overflow-hidden rounded-[22px] bg-white ring-1 ring-black/[0.04] transition-transform duration-300 ease-out hover:-translate-y-3 focus-visible:-translate-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004225]/35 sm:h-[390px] sm:w-[280px] lg:h-[430px] lg:w-[320px]";
  const style = {
    backgroundImage: `url("${getCityImageUrl(city, "720x980")}")`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
  const content = (
    <>
      <span className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/72 transition-opacity group-hover:opacity-95" />
      <span className="absolute bottom-5 left-5 max-w-[calc(100%-2.5rem)] break-words text-[24px] font-medium leading-[1.05] text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.42)] sm:bottom-6 sm:left-6 sm:text-[28px]">
        {city}
      </span>
    </>
  );

  if (!platformLaunched) {
    return (
      <div className={cardClassName} style={style} aria-label={city}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/cities/${encodeURIComponent(city)}`}
      aria-label={t("home.cities.openAria", { city })}
      className={cardClassName}
      style={style}
    >
      {content}
    </Link>
  );
}

export function CityCarousel() {
  const { t } = useI18n();
  const platformLaunched = isPlatformLaunched();
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (!platformLaunched) {
      setCities([]);
      return;
    }

    let active = true;

    listingService
      .getCities()
      .then((cityResult) => {
        if (!active) return;

        const nextCities = uniqueOnly(
          cityResult
            .map(normalizeCityName)
            .filter((city) => city.length > 0),
        ).sort((a, b) => a.localeCompare(b, "sv-SE"));

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

  const displayCities = cities.length > 0 ? cities : FALLBACK_CITIES.map(normalizeCityName);
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
              key={`${city}-${index}`}
              city={city}
              platformLaunched={platformLaunched}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

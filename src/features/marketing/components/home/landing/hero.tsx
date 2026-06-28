"use client";

import React from "react";
import { preload } from "react-dom";

import { FlipWords } from "@/components/ui/flip-words";
import { Button } from "@/components/ui/button";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";

type HeroProps = {
  title: string | React.ReactNode;
  flipWords?: string[];
  flipWordsClassName?: string;
  subtitle?: string;
  backgroundClassName?: string;
  previewImageSrc?: string;
  previewImageAlt?: string;
  waitlistHref?: string;
  businessHref?: string;
  interestCta?: string;
  businessCta?: string;
};

const MOCKUP_HERO_SRC = "/mockup-hero.webp";
const MOCKUP_HERO_DEFAULT_SRC = "/mockup-hero-768.webp";
const MOCKUP_HERO_SRC_SET =
  "/mockup-hero-480.webp 480w, /mockup-hero-700.webp 700w, /mockup-hero-768.webp 768w, /mockup-hero.webp 960w";
const MOCKUP_HERO_SIZES = "(max-width: 640px) 96vw, 700px";

export const Hero: React.FC<HeroProps> = ({
  title,
  flipWords,
  flipWordsClassName = "text-emerald-600",
  subtitle,
  backgroundClassName = "bg-background",
  previewImageSrc = "/CampusLyan-Mockup.svg",
  previewImageAlt,
  waitlistHref = "#register-waitlist",
  businessHref = "/for-business",
  interestCta,
  businessCta,
}) => {
  const { dictionary, t } = useI18n();
  const words =
    flipWords && flipWords.length > 0
      ? flipWords
      : [...dictionary.home.hero.flipWords];
  const usesOptimizedMockup = previewImageSrc === MOCKUP_HERO_SRC;
  const previewImageHeight = usesOptimizedMockup ? 616 : 540;

  if (usesOptimizedMockup) {
    preload(MOCKUP_HERO_DEFAULT_SRC, {
      as: "image",
      fetchPriority: "high",
      imageSizes: MOCKUP_HERO_SIZES,
      imageSrcSet: MOCKUP_HERO_SRC_SET,
      type: "image/webp",
    });
  }

  return (
    <section className={`relative overflow-hidden ${backgroundClassName}`}>
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 pb-12 pt-12 sm:pb-16 sm:pt-14 md:px-8 md:pb-24 md:pt-24">
        <div className="flex w-full flex-col items-center justify-center">
          <h1 className="order-1 mx-auto max-w-4xl text-center text-[2rem] font-black leading-[1.1] text-slate-900 sm:text-5xl md:text-6xl">
            {title}
            <br className="hidden sm:block" />
            <span className={`mt-2 block sm:mt-0 sm:inline-block sm:min-h-[1.2em] ${flipWordsClassName}`}>
              <FlipWords words={words} duration={2500} className={flipWordsClassName} />
            </span>
          </h1>
          <div className="order-2 mt-8 w-full max-w-[700px] md:order-4 md:mt-14">
            <div className="relative overflow-hidden rounded-[18px] shadow-[0_22px_50px_rgba(15,23,42,0.16)] ring-1 ring-black/5">
              <img
                src={usesOptimizedMockup ? MOCKUP_HERO_DEFAULT_SRC : previewImageSrc}
                srcSet={usesOptimizedMockup ? MOCKUP_HERO_SRC_SET : undefined}
                sizes={usesOptimizedMockup ? MOCKUP_HERO_SIZES : undefined}
                alt={previewImageAlt ?? t("home.hero.previewAlt")}
                width={960}
                height={previewImageHeight}
                className="h-auto w-full object-contain"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
          {subtitle ? (
            <p className="order-3 mt-6 max-w-2xl px-1 text-center text-sm text-slate-600 sm:text-base md:order-2 md:text-lg">
              {subtitle}
            </p>
          ) : null}
          <div className="order-4 mt-6 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row md:order-3">
            <Button as={Link} href={waitlistHref} variant="default" className="w-full rounded-full px-6 sm:w-auto">
              {interestCta ?? t("home.hero.interestCta")}
            </Button>
            <Button as={Link} href={businessHref} variant="secondary" className="w-full rounded-full px-6 sm:w-auto">
              {businessCta ?? t("home.hero.businessCta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

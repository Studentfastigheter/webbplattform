"use client";

import React from "react";
import Image from "next/image";

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

export const Hero: React.FC<HeroProps> = ({
  title,
  flipWords,
  flipWordsClassName = "text-emerald-600",
  subtitle,
  backgroundClassName = "bg-background",
  previewImageSrc = "/platform-demo.png",
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

  return (
    <section className={`relative overflow-hidden ${backgroundClassName}`}>
      <div className="pointer-events-none absolute left-0 top-1/2 h-full w-full -translate-y-1/2 overflow-hidden">
        <div className="absolute -left-64 top-1/4 hidden h-96 w-96 rounded-full bg-emerald-100/50 opacity-50 blur-3xl md:block" />
        <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 pb-12 pt-12 sm:pb-16 sm:pt-14 md:px-8 md:pb-24 md:pt-24">
        <div className="flex w-full flex-col items-center justify-center">
          <h1 className="order-1 mx-auto max-w-4xl text-center text-[2rem] font-black leading-[1.1] text-slate-900 sm:text-5xl md:text-6xl">
            {title}
            <br className="hidden sm:block" />
            <span className={`mt-2 block sm:mt-0 sm:inline-block sm:min-h-[1.2em] ${flipWordsClassName}`}>
              <FlipWords words={words} duration={2500} className={flipWordsClassName} />
            </span>
          </h1>
          <div className="order-2 mt-8 w-full max-w-[1400px] md:order-4 md:mt-14">
            <div className="pointer-events-none absolute inset-x-4 -bottom-8 hidden h-24 rounded-full bg-emerald-300/25 blur-3xl sm:inset-x-8 md:block" />
            <Image
              src={previewImageSrc}
              alt={previewImageAlt ?? t("home.hero.previewAlt")}
              width={1920}
              height={1080}
              sizes="(max-width: 640px) 96vw, (max-width: 1024px) 92vw, (max-width: 1536px) 88vw, 1400px"
              className="relative z-10 h-auto w-full object-contain drop-shadow-[0_24px_45px_rgba(15,23,42,0.22)]"
              priority
            />
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

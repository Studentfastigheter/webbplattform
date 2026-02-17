"use client";

import React from "react";
import { FlipWords } from "@/components/ui/flip-words";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
};

export const Hero: React.FC<HeroProps> = ({
  title,
  flipWords,
  flipWordsClassName = "text-emerald-600",
  subtitle,
  backgroundClassName = "bg-background",
  previewImageSrc = "/platform-demo.png",
  previewImageAlt = "Preview av CampusLyan-plattformen",
  waitlistHref = "#register-waitlist",
  businessHref = "/for-foretag",
}) => {
  const words =
    flipWords && flipWords.length > 0
      ? flipWords
      : ["Göteborg", "Stockholm", "Lund", "Uppsala", "Linköping", "Örebro", "Malmö", "Umeå"];

  return (
    <section className={`relative overflow-hidden ${backgroundClassName}`}>
      <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-full h-full overflow-hidden">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -z-10" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 pb-12 pt-12 sm:pb-16 sm:pt-14 md:px-8 md:pb-24 md:pt-24">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h1 className="mx-auto max-w-4xl text-center text-[2rem] font-black leading-[1.1] text-slate-900 sm:text-5xl md:text-6xl">
            {title}
            <br className="hidden sm:block" />
            <span className={`mt-2 block sm:inline-block sm:min-h-[1.2em] sm:mt-0 ${flipWordsClassName}`}>
              <FlipWords words={words} duration={2500} className={flipWordsClassName} />
            </span>
          </h1>
          {subtitle ? (
            <p className="max-w-2xl px-1 text-center text-sm text-slate-600 sm:text-base md:text-lg">{subtitle}</p>
          ) : null}
          <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 sm:max-w-none sm:flex-row">
            <Button as={Link} href={waitlistHref} variant="default" className="w-full rounded-full px-6 sm:w-auto">
              Join the waitlist
            </Button>
            <Button as={Link} href={businessHref} variant="secondary" className="w-full rounded-full px-6 sm:w-auto">
              För företag
            </Button>
          </div>
        </div>

        <div className="relative mt-8 w-full max-w-[1400px] sm:mt-10 md:mt-14">
          <div className="pointer-events-none absolute inset-x-4 -bottom-8 h-24 rounded-full bg-emerald-300/25 blur-3xl sm:inset-x-8" />
          <Image
            src={previewImageSrc}
            alt={previewImageAlt}
            width={1920}
            height={1080}
            sizes="(max-width: 640px) 96vw, (max-width: 1024px) 92vw, (max-width: 1536px) 88vw, 1400px"
            className="relative z-10 h-auto w-full object-contain drop-shadow-[0_24px_45px_rgba(15,23,42,0.22)]"
            priority
          />
        </div>
      </div>
    </section>
  );
};

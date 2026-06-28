import Image from "next/image";

import { Features } from "@/features/marketing/components/home/landing/features";
import { CityCarousel } from "@/features/marketing/components/home/landing/city-carousel";
import { Hero } from "@/features/marketing/components/home/landing/hero";
import { HeroWaitlist } from "@/features/marketing/components/home/landing/hero_waitlist";
import StepsTimeline from "@/features/marketing/components/home/landing/StepsTimeline";
import { StickyCards } from "@/features/marketing/components/home/landing/sticky-cards";
import { getHomePageData } from "@/data/home-page";
import { getDictionary } from "@/i18n/server";

const listingMockups = [
  {
    src: "/images/mockups/listing1.webp",
    className: "sm:mt-6 lg:mt-10",
  },
  {
    src: "/images/mockups/listing2.webp",
    className: "",
  },
  {
    src: "/images/mockups/listing3.webp",
    className: "sm:mt-3 lg:mt-6",
  },
  {
    src: "/images/mockups/listing4.webp",
    className: "sm:mt-8 lg:mt-12",
  },
];

function ListingMockupShowcase({
  altPrefix,
  label,
}: {
  altPrefix: string;
  label: string;
}) {
  return (
    <section
      className="landing-deferred-section relative bg-background px-4 pb-12 pt-2 sm:px-6 sm:pb-16 lg:pb-20"
      aria-label={label}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-center justify-items-center gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {listingMockups.map((mockup, index) => (
          <div
            key={mockup.src}
            className={`w-full max-w-[176px] sm:max-w-[232px] md:max-w-[270px] lg:max-w-[292px] ${mockup.className}`}
          >
            <Image
              src={mockup.src}
              alt={`${altPrefix} ${index + 1}`}
              width={777}
              height={728}
              sizes="(max-width: 640px) 44vw, (max-width: 1024px) 232px, 292px"
              className="h-auto w-full rounded-[18px] object-contain shadow-[0_20px_45px_rgba(15,23,42,0.14)] ring-1 ring-black/5"
              loading="lazy"
              fetchPriority="low"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function Home() {
  const dictionary = await getDictionary();
  const { featuresData, stickyCardsData, stepsData } = getHomePageData(dictionary);
  const home = dictionary.home;

  return (
    <main className="main-marketing-theme relative overflow-x-clip bg-background font-sans text-foreground">
      <Hero
        title={home.hero.title}
        flipWords={[...home.hero.flipWords]}
        flipWordsClassName="!text-pop-contrast !z-10 relative"
        subtitle={home.hero.subtitle}
        waitlistHref="#register-waitlist"
        businessHref="/for-business"
        interestCta={home.hero.interestCta}
        businessCta={home.hero.businessCta}
        previewImageSrc="/mockup-hero.webp"
        previewImageAlt={home.hero.previewAlt}
        backgroundClassName="bg-background"
      />

      <StepsTimeline
        heading={
          <>
            {home.steps.headingStart}{" "}
            <span className="text-pop-contrast">{home.steps.headingHighlight}</span>{" "}
            {home.steps.headingEnd}
          </>
        }
        steps={stepsData}
      />
      <ListingMockupShowcase
        altPrefix={home.listingAltPrefix}
        label={home.listingShowcaseLabel}
      />
      <StickyCards
        sectionClassName="bg-background"
        heading={
          <>
            {home.stickyCards.headingStart}
            <br />
            <span className="text-pop-contrast">{home.stickyCards.headingHighlight}</span>
          </>
        }
        cards={stickyCardsData}
      />
      <CityCarousel />

      <Features
        sectionClassName="bg-background"
        heading={
          <>
            {home.features.headingStart}
            <br />
            <span className="text-pop-contrast">{home.features.headingHighlight}</span>
          </>
        }
        features={featuresData}
        moreLabel={dictionary.common.more}
      />

      <HeroWaitlist
        id="register-waitlist"
        backgroundClassName="bg-background"
        heading={home.waitlist.heading}
        subtitle={home.waitlist.subtitle}
      />
    </main>
  );
}

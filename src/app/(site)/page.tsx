import { Features } from "@/features/marketing/components/home/landing/features";
import { CityCarousel } from "@/features/marketing/components/home/landing/city-carousel";
import { FeaturedListings } from "@/features/marketing/components/home/landing/featured-listings";
import { Hero } from "@/features/marketing/components/home/landing/hero";
import { HeroWaitlist } from "@/features/marketing/components/home/landing/hero_waitlist";
import StepsTimeline from "@/features/marketing/components/home/landing/StepsTimeline";
import { StickyCards } from "@/features/marketing/components/home/landing/sticky-cards";
import { getHomePageData } from "@/data/home-page";
import { getDictionary } from "@/i18n/server";
import { isPlatformLaunched } from "@/lib/platform-launch";

export default async function Home() {
  const dictionary = await getDictionary();
  const { featuresData, stickyCardsData, stepsData } = getHomePageData(dictionary);
  const home = dictionary.home;
  const platformLaunched = isPlatformLaunched();

  return (
    <main className="main-marketing-theme relative overflow-x-clip bg-background font-sans text-foreground">
      <Hero
        title={home.hero.title}
        flipWords={[...home.hero.flipWords]}
        flipWordsClassName="!text-pop-contrast !z-10 relative"
        subtitle={home.hero.subtitle}
        primaryHref={platformLaunched ? "/housing" : "#register-waitlist"}
        primaryCta={platformLaunched ? home.hero.searchCta : home.hero.interestCta}
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
      <FeaturedListings />
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

      {!platformLaunched ? (
        <HeroWaitlist
          id="register-waitlist"
          backgroundClassName="bg-background"
          heading={home.waitlist.heading}
          subtitle={home.waitlist.subtitle}
        />
      ) : null}
    </main>
  );
}

import { Features } from "@/components/features/home/landing/features";
import { Hero } from "@/components/features/home/landing/hero";
import { HeroWaitlist } from "@/components/features/home/landing/hero_waitlist";
import StepsTimeline from "@/components/features/home/landing/StepsTimeline";
import { StickyCards } from "@/components/features/home/landing/sticky-cards";
import { featuresData, stickyCardsData, stepsData } from "@/data/home-page";

export default function Home() {
  return (
    <main className="font-sans text-foreground bg-background">
      <Hero
        title="Lyor för studenter i"
        flipWords={["Göteborg", "Stockholm", "Lund", "Uppsala", "Linköping"]}
        flipWordsClassName="!text-pop-contrast !z-10 relative"
        subtitle="Allt för studentboende i hela Sverige. Bostäder, köer, verifierade privatuthyrare och guider. Helt gratis."
        waitlistHref="#register-waitlist"
        businessHref="/for-foretag"
        previewImageSrc="/platform-demo.png"
        previewImageAlt="Preview av CampusLyan plattformen"
        backgroundClassName="bg-background"
      />

      <StickyCards
        badge="CampusLyan"
        sectionClassName="bg-background"
        heading={
          <>
            Mindre krångel.<br />
            <span className="text-pop-contrast">Större chans att få bostad.</span>
          </>
        }
        cards={stickyCardsData}
      />

      <StepsTimeline
        badge="Så funkar det"
        heading={
          <>
            Från registrering till <span className="text-pop-contrast">inflytt</span> i tre steg
          </>
        }
        steps={stepsData}
      />

      <Features
        badge="Mer än en söksida"
        sectionClassName="bg-background"
        heading={
          <>
            Verktyg som gör skillnad.<br />
            <span className="text-pop-contrast">Före, under och efter studietiden.</span>
          </>
        }
        features={featuresData}
      />

      <HeroWaitlist id="register-waitlist" backgroundClassName="bg-background" />
    </main>
  );
}

import Image from "next/image";

import { Features } from "@/features/marketing/components/home/landing/features";
import { CityCarousel } from "@/features/marketing/components/home/landing/city-carousel";
import { Hero } from "@/features/marketing/components/home/landing/hero";
import { HeroWaitlist } from "@/features/marketing/components/home/landing/hero_waitlist";
import StepsTimeline from "@/features/marketing/components/home/landing/StepsTimeline";
import { StickyCards } from "@/features/marketing/components/home/landing/sticky-cards";
import { featuresData, stickyCardsData, stepsData } from "@/data/home-page";

const listingMockups = [
  {
    src: "/images/mockups/listing1.png",
    className: "sm:mt-6 lg:mt-10",
  },
  {
    src: "/images/mockups/listing2.png",
    className: "",
  },
  {
    src: "/images/mockups/listing3.png",
    className: "sm:mt-3 lg:mt-6",
  },
  {
    src: "/images/mockups/listing4.png",
    className: "sm:mt-8 lg:mt-12",
  },
];

function ListingMockupShowcase() {
  return (
    <section className="relative bg-background px-4 pb-12 pt-2 sm:px-6 sm:pb-16 lg:pb-20" aria-label="Exempelannonser">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-center justify-items-center gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {listingMockups.map((mockup, index) => (
          <div
            key={mockup.src}
            className={`w-full max-w-[176px] sm:max-w-[232px] md:max-w-[270px] lg:max-w-[292px] ${mockup.className}`}
          >
            <Image
              src={mockup.src}
              alt={`Exempelannons ${index + 1}`}
              width={777}
              height={728}
              sizes="(max-width: 640px) 44vw, (max-width: 1024px) 232px, 292px"
              quality={100}
              className="h-auto w-full rounded-[18px] object-contain shadow-[0_20px_45px_rgba(15,23,42,0.14)] ring-1 ring-black/5"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="main-marketing-theme relative overflow-x-clip font-sans text-foreground bg-background">
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

      

      <StepsTimeline
        heading={
          <>
            Från registrering till <span className="text-pop-contrast">inflytt</span> i tre steg
          </>
        }
        steps={stepsData}
      />
      <ListingMockupShowcase />
      <StickyCards
        sectionClassName="bg-background"
        heading={
          <>
            Mindre krångel.
            <br />
            <span className="text-pop-contrast">Större chans att få bostad.</span>
          </>
        }
        cards={stickyCardsData}
      />
      <CityCarousel />
      

      <Features
        sectionClassName="bg-background"
        heading={
          <>
            Verktyg som gör skillnad.
            <br />
            <span className="text-pop-contrast">Före, under och efter studietiden.</span>
          </>
        }
        features={featuresData}
      />

      <HeroWaitlist id="register-waitlist" backgroundClassName="bg-background" />
    </main>
  );
}

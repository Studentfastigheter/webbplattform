import { Hero } from '@/components/sections/hero';
import { StickyCards } from '@/components/sections/sticky-cards';
import { Features } from '@/components/sections/features';
import { HeroWaitlist } from '@/components/sections/hero_waitlist';
import StepsTimeline from './components/Home/StepsTimeline';
import { UserPlus, Search, KeyRound } from "lucide-react";

const stickyCardsData = [
  {
    title: "Allt samlat på ett ställe",
    text: "Hitta studentbostäder i hela Sverige och ställ dig i rätt köer utan att hoppa mellan olika sidor.",
    img: ""
  },
  {
    title: "Trygg privatuthyrning",
    text: "Verifierade uthyrare och säkrare kontakt än i öppna Facebook grupper med mindre risk för bedrägerier.",
    img: ""
  },
  {
    title: "Guider som hjälper dig lyckas",
    text: "Få koll på regler, dokument och ansökningar så att du ökar chansen att få bostad.",
    img: ""
  }
];

const stepsData = [
  {
    icon: UserPlus,
    title: "Skapa din profil",
    desc: "Fyll i dina uppgifter en gång och använd profilen när du söker bostad eller kontaktar uthyrare.",
  },
  {
    icon: Search,
    title: "Hitta rätt bostäder och köer",
    desc: "Se vilka bostäder som finns och vilka köer du bör ställa dig i för att inte missa någon möjlighet.",
  },
  {
    icon: KeyRound,
    title: "Sök och flytta in",
    desc: "Ansök direkt, kontakta verifierade privatuthyrare och byt bostad om du ska på utbyte, praktik eller sommarjobb.",
  },
];

const featuresData = [
  {
    badge: "Bostadsköer",
    color: "bg-primary",
    title: "Rätt köer för rätt stad",
    tags: ["Missa inga köer", "Stad för stad", "Prioritera smart"],
    img: ""
  },
  {
    badge: "Profil",
    color: "bg-primary",
    title: "Ansök med en profil som ger seriöst intryck",
    tags: ["Snabb kontakt", "Proffsigt", "Spara tid"],
    img: ""
  },
  {
    badge: "Studentliv",
    color: "bg-primary",
    title: "Aktiviteter och rabatter nära ditt boende",
    tags: ["Studentaktiviteter", "Lokala erbjudanden", "Partners"],
    img: ""
  },
  {
    badge: "Bostadsbyte",
    color: "bg-primary",
    title: "Byt boende med andra studenter när du är borta",
    tags: ["Utbyte", "Praktik", "Sommarjobb"],
    img: ""
  }
];

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
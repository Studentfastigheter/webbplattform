import fs from 'fs';
import path from 'path';
import { Hero } from '@/components/sections/hero';
import { LogoMarquee } from '@/components/sections/logo-marquee';
import { StickyCards } from '@/components/sections/sticky-cards';
import { Features } from '@/components/sections/features';
import StepsTimeline from './components/Home/StepsTimeline';
import { UserPlus, Search, KeyRound } from "lucide-react";

// Funktion för att hämta loggor från mappen
const getLogoData = () => {
  // Sökväg till mappen
  const logosDirectory = path.join(process.cwd(), 'public/logos/built_by_teams_from');
  
  try {
    const filenames = fs.readdirSync(logosDirectory);
    
    // FILTRERING: Vi tar bort systemfiler (t.ex .DS_Store) och behåller bara bilder
    const validExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    
    const logos = filenames
      .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
      .map((filename) => ({
        // Tar bort filändelse och ersätter bindestreck/understreck med mellanslag för alt-text
        alt: filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        src: `/logos/built_by_teams_from/${filename}`,
      }));

    return logos;
  } catch (error) {
    console.warn("Kunde inte hitta logomappen eller den är tom.", error);
    return [];
  }
};

const stickyCardsData = [
  {
    title: "Total överblick",
    text: "Hitta rätt direkt med campusbaserad sökning och smart bevakning. Vi samlar objekt från både bostadsbolag och privata uthyrare så du slipper ha 20 flikar öppna.",
    img: "URL_TILL_IKON_FORSTORINGSGLAS"
  },
  {
    title: "Verifierad trygghet",
    text: "Slipp oseriösa grupper och bedrägerier. Vi verifierar alla uthyrare och skapar en säker mötesplats där du kan söka bostad eller hyra ut utan att riskera att bli lurad.",
    img: "URL_TILL_IKON_LAS_ELLER_SKOLD"
  },
  {
    title: "En profil – alla möjligheter",
    text: "Skapa din studentprofil en gång och använd den överallt. Presentera dig proffsigt för hyresvärdar och visa att du är seriös med ett enda klick.",
    img: "URL_TILL_IKON_PROFIL_ELLER_INSTALLLNINGAR"
  }
];

const stepsData = [
  {
    icon: UserPlus,
    title: "Skapa din studentprofil",
    desc: "Kom igång på några sekunder. Välj din studieort så anpassar vi flödet med relevanta bostadsbolag och områden som matchar just din skola.",
  },
  {
    icon: Search,
    title: "Hitta rätt köer & lyor",
    desc: "Utforska bostäder nära campus och se var dina köpoäng faktiskt räcker till. Vi samlar alla hyresvärdar på ett ställe så att du slipper leta manuellt.",
  },
  {
    icon: KeyRound,
    title: "Sök och ta kontakt",
    desc: "Vi guidar dig direkt till rätt ansökan hos bostadsbolagen eller låter dig ta en trygg första kontakt med verifierade privatvärdar. Resten är bara inflytt!",
  },
];
const featuresData = [
  {
    badge: "Total överblick",
    color: "bg-primary",
    title: "Vi samlar studentbostäder från landets alla hörn",
    tags: ["Bostadsbolag", "Privata uthyrare", "Kommunala köer"],
    img: "https://cdn.prod.website-files.com/673c77fb9e60433ef22d4b0f/67e15bd757a81406650d7925_Forvaltning%20image%20SE%20small.png"
  },
  {
    badge: "Trygghet",
    color: "bg-primary",
    title: "En verifierad marknadsplats fri från bedrägerier",
    tags: ["Granskade uthyrare", "Säkra avtal", "Inga oseriösa grupper"],
    img: "https://cdn.prod.website-files.com/673c77fb9e60433ef22d4b0f/67e15bea7c431299abee0d0d_Communication%20image%20SE%20small.png"
  },
  {
    badge: "Smidighet",
    color: "bg-primary",
    title: "En profil – oändliga möjligheter att söka",
    tags: ["Studentprofil", "Visa seriositet", "Spara tid"],
    img: "https://cdn.prod.website-files.com/673c77fb9e60433ef22d4b0f/67e15bc3751d6f15c0d87091_Boendetjanster%20image%20SE%20small.png"
  },
  {
    badge: "Studentliv",
    color: "bg-primary",
    title: "Kunskap som maximerar dina chanser",
    tags: ["Köguider", "Hyresregler", "Spartips"],
    img: "https://cdn.prod.website-files.com/673c77fb9e60433ef22d4b0f/679367011ddb054f5e7cf232_Smart%20property%20image%20SE%20small.png"
  }
];
export default function Home() {
  const logoData = getLogoData();

  return (
    <main className="font-sans text-foreground bg-background">
      <Hero
        title="Lyor för studenter i"
        flipWords={["Göteborg", "Stockholm", "Lund", "Uppsala", "Linköping"]}
        mainImage={{
          src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675fd56ee2ebe46fa20c27a6_Devices%20SE.png',
          alt: 'Devices',
        }}
        floatingImages={[
          {
            src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67b5e71b79dd9bba8852dd8d_Bento%20card%20vertical%20SE.png',
            alt: 'Boka tvättstuga',
            className: 'top-1/4 -left-10 md:left-0 w-64 transform -rotate-6',
          },
          {
            src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67b5e7f28a7f0840c79e9414_Bento%20card%20horizontal%2004%20SE.png',
            alt: 'Betalning',
            className: 'bottom-10 -right-10 md:right-0 w-72 transform rotate-3',
          },
        ]}
      />

      {/* Skicka bara komponenten om det finns loggor */}
      {logoData.length > 0 && (
        <LogoMarquee logos={logoData} speed={20} />
      )}

      <StickyCards 
        badge="Vår plattform"
        heading={
          <>
            Allt du behöver för att<br />
            <span className="text-pop">hitta eller hyra ut.</span>
          </>
        }
        cards={stickyCardsData}
      />
      <StepsTimeline 
        badge="Så funkar det"
        heading={
          <>
            Från registrering till <span className="text-pop">inflytt</span> på tre steg
          </>
        }
        steps={stepsData}
      />
      <Features 
        badge="Plattformen"
        heading={
          <>
            Vi digitaliserar boenderesan.<br />
            <span className="text-pop">Från inflytt till utflytt.</span>
          </>
        }
        features={featuresData}
      />
    </main>
  );
}
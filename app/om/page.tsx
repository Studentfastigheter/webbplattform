import Image from "next/image";
import { SectionBadge } from "@/components/ui/section-badge";
import {
  ShieldCheck,
  Users2,
  Linkedin,
  Mail,
  Search,
  MapPin,
} from "lucide-react";
import { image } from "@heroui/theme";

// --- DATA ---

type Highlight = { label: string; value: string };
type ValueCard = {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};
type TeamMember = { 
  name: string; 
  role: string; 
  image?: string; 
  linkedin?: string;
  email?: string;
};

const STATS: Highlight[] = [
  { label: "Lansering", value: "2026" },
  { label: "Publicerade bostäder", value: "0" },
  { label: "Registrerade studenter", value: "0" },
];

const VALUE_CARDS: ValueCard[] = [
  {
    title: "Hela marknaden på ett ställe",
    description: "Slipp leta på dussintals sajter. Vi samlar bostäder från alla bostadsföretag och bostadsköer i Sverige på en enda plattform.",
    imageAlt: "Översikt av bostadsmarknaden samlad på ett ställe",
  },
  {
    title: "Designat för studentlivet",
    description: "Hitta rätt direkt. Se resevägar till din skola och var närmaste studieaktiviteter finns. Vi hjälper dig bo där livet fungerar.",
    imageAlt: "Studentliv och boende nära campus",
  },
  {
    title: "Helt kostnadsfritt",
    description: "Att hitta en lya ska inte kosta pengar. CampusLyan är helt gratis för studenter att använda – inga dolda avgifter, bara en enklare väg till bostad.",
    imageAlt: "Kostnadsfri bostadssökning för studenter",
  },
  {
    title: "Alltid verifierade aktörer",
    description: "Din trygghet är vår prioritet. Vi verifierar samtliga hyresvärdar och aktörer på plattformen så att du kan söka bostad tryggt och säkert utan risk för bedrägerier.",
    imageAlt: "Trygg och verifierad bostadsplattform",
  },
];

const FEATURED_VALUE_CARDS = VALUE_CARDS.slice(0, 2);
const VALUE_FALLBACK_ICONS = [Search, MapPin, Users2, ShieldCheck];

const TEAM_CATEGORIES = [
  {
    title: "Ledning",
    members: [
      {
        name: "Simon Carlén",
        role: "CEO & CTO",
        image: "/team/Profilbild-Simon.jpeg",
        linkedin: "https://www.linkedin.com/in/simon-carlén/",
        email: "simon.carlen@campuslyan.se",
      },
      {
        name: "Alvin Stallgård",
        role: "Chief Commercial Officer",
        image: "/team/Profilbild-Alvin.jpeg",
        linkedin: "https://www.linkedin.com/in/alvin-stallg%C3%A5rd-346abb290/",
        email: "alvin.stallgard@campuslyan.se",
      },
      {
        name: "Viktor Kristiansson",
        role: "Head of Backend & Security",
        image: "/team/Profilbild-Viktor.jpeg",
        linkedin: "https://www.linkedin.com/in/viktor-fazlagic/",
      },
    ],
  },
  {
    title: "Kommersiellt & Marknad",
    members: [
      { name: "Alve Nilsson", 
        role: "Commercial Associate",
        image: "/team/Profilbild-Alve.jpeg",
        linkedin: "https://www.linkedin.com/in/alve-nilsson-47710a226/",
        email: "alve.nilsson@campuslyan.se",
      },
      { name: "Malte Stål", 
        role: "Commercial Associate",
        image: "/team/Profilbild-Malte.jpg",
        linkedin: "https://www.linkedin.com/in/malte-stal/",
        email: "malte.stal@campuslyan.se",
      },
    ],
  },
  {
    title: "Produkt & Utveckling",
    members: [
      {
        name: "Marco Speziale",
        role: "Backend Engineer",
        linkedin: "https://www.linkedin.com/in/marco-speziale-1ba67a169/",
      },
      {
        name: "Mikael Överfjord",
        role: "Backend Engineer",
        image: "/team/Profilbild-Mikael.jpeg",
        linkedin: "https://www.linkedin.com/in/mikael-överfjord-ba12663a0/",
      },
      {
        name: "Lucas Ryefalk",
        role: "Frontend Engineer",
        image: "/team/Profilbild-Lucas.jpeg",
        linkedin: "https://www.linkedin.com/in/lucas-ryefalk-a85a37292/",
      },
      {
        name: "William Jaarma",
        role: "System Engineer",
        image: "/team/Profilbild-William.jpeg",
        linkedin: "https://www.linkedin.com/in/william-jaarma-8b864a245/",
      },
      {
        name: "Sumiya Sayeed",
        role: "Frontend Engineer",
        image: "/team/Profilbild-Sumiya.png",
        linkedin: "https://www.linkedin.com/in/sumiya-sayeed-04a9319b/",
      },
    ],
  },
  
];

// --- KOMPONENTER ---

function SectionHeading({ 
  eyebrow, 
  title, 
  description,
  center = false 
}: { 
  eyebrow?: string; 
  title: string; 
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl mb-16 ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <div className={center ? "flex justify-center" : ""}>
          <SectionBadge text={eyebrow} />
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function StatItem({ label, value }: Highlight) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 text-center md:px-8 md:py-10">
      <p className="text-4xl font-semibold tracking-tight text-foreground tabular-nums md:text-5xl">
        {value}
      </p>
      <div className="mt-4 h-px w-10 bg-border/80" />
      <p className="mt-4 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function ValueFeature({ item, index }: { item: ValueCard; index: number }) {
  const isAlternating = index % 2 === 1;
  const FallbackIcon = VALUE_FALLBACK_ICONS[index % VALUE_FALLBACK_ICONS.length];

  return (
    <article className="grid grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:gap-16">
      <div className={`max-w-2xl ${isAlternating ? "order-1 lg:order-2" : "order-1"}`}>
        <h3 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {item.title}
        </h3>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      </div>

      <div className={isAlternating ? "order-2 lg:order-1" : "order-2"}>
        <div className={`flex ${isAlternating ? "justify-start" : "justify-start lg:justify-end"}`}>
          <div className="relative aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[2rem] bg-secondary/35">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.imageAlt ?? item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 36vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary/70 via-background to-secondary/50">
                <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
                  <FallbackIcon className="h-12 w-12 text-primary/70" />
                  <p className="text-sm font-medium">Lägg till en bild här</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="group flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="relative z-10 h-40 w-40 overflow-hidden rounded-full border-4 border-background bg-card shadow-lg">
          {member.image ? (
            <Image src={member.image} alt={member.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <Users2 className="h-16 w-16" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 rounded-full border border-primary/20 scale-110 -z-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
      <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">{member.role}</p>

      <div className="flex items-center gap-3 justify-center mt-1">
        {member.linkedin && (
          <a 
            href={member.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={`LinkedIn för ${member.name}`}
          >
            <Linkedin className="w-5 h-5" />
          </a>
        )}
        
        {member.email && (
          <a 
            href={`mailto:${member.email}`}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={`Maila ${member.name}`}
          >
            <Mail className="w-5 h-5" />
          </a>
        )}
      </div>

    </div>
  );
}

// --- HUVUDSIDA ---

export default function OmPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      
      {/* 1. HERO & STORY */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16 flex flex-col">
            <div className="order-1 flex justify-center">
              <SectionBadge text="Vår resa" />
            </div>
            <h1 className="order-2 text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
              Byggt på Chalmers <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pop-contrast">för studenter i hela Sverige</span>
            </h1>
            <p className="order-4 mt-8 text-xl text-muted-foreground leading-relaxed md:order-3 md:mt-0">
              Vi som grundade CampusLyan är själva studenter. Efter att ha upplevt hur krångligt och otryggt det kan vara att söka bostad, bestämde vi oss för att bygga lösningen vi själva saknade.
            </p>

            <div className="order-3 relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm md:order-4 md:mt-10">
              <Image
                src="/team/group.jpg"
                alt="CampusLyan-teamet"
                width={1618}
                height={911}
                sizes="(max-width: 768px) 100vw, 896px"
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Stats
          <div className="mx-auto max-w-5xl border-y border-border/80">
            <div className="grid grid-cols-1 divide-y divide-border/80 md:grid-cols-3 md:divide-x md:divide-y-0">
              {STATS.map((stat) => (
                <StatItem key={stat.label} {...stat} />
              ))}
            </div>
          </div>
          */}
        </div>
      </section>

      {/* <SocialProofFullWidth /> */}

      {/* 2. VISION (Grå bakgrund)
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Vår vision"
            title="Mer än bara en annonssida"
            description="Från en enkel idé till en nationell samlingsplats. Vi är en guide som hjälper studenter att förstå marknaden och en trygg brygga för hyresvärdar."
            center
          />

          <div className="space-y-10">
            {FEATURED_VALUE_CARDS.map((card, index) => (
              <ValueFeature key={card.title} item={card} index={index} />
            ))}
          </div>
        </div>
      </section>
      */}
      {/* 3. TEAM */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="Möt teamet"
            description="Vi kombinerar våra erfarenheter från Chalmers med viljan att förbättra bostadsmarknaden för alla."
          />

          <div className="space-y-24">
            {TEAM_CATEGORIES.map((category) => (
              <div key={category.title}>
                <div className="flex items-center mb-12">
                  <h3 className="text-2xl font-bold text-foreground mr-6">
                    {category.title}
                  </h3>
                  <div className="h-px bg-border flex-grow"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                  {category.members.map((member) => (
                    <MemberCard key={member.name} member={member} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { SectionBadge } from "@/components/ui/section-badge";
import {
  ShieldCheck, 
  MapPin, 
  Users2, 
  Lock, 
  Linkedin,
  Mail, // Ny import
  LucideIcon,
  Search
} from "lucide-react";

// --- DATA ---

type Highlight = { label: string; value: string };
type ValueCard = { title: string; description: string; icon: LucideIcon };
type TeamMember = { 
  name: string; 
  role: string; 
  image?: string; 
  linkedin?: string;
  email?: string; // Nytt fält för e-post
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
    icon: Search,
  },
  {
    title: "Designat för studentlivet",
    description: "Hitta rätt direkt. Se resevägar till din skola och var närmaste studieaktiviteter finns. Vi hjälper dig bo där livet fungerar.",
    icon: MapPin,
  },
  {
    title: "Helt kostnadsfritt",
    description: "Att hitta en lya ska inte kosta pengar. CampusLyan är helt gratis för studenter att använda – inga dolda avgifter, bara en enklare väg till bostad.",
    icon: Users2,
  },
  {
    title: "Alltid verifierade aktörer",
    description: "Din trygghet är vår prioritet. Vi verifierar samtliga hyresvärdar och aktörer på plattformen så att du kan söka bostad tryggt och säkert utan risk för bedrägerier.",
    icon: ShieldCheck,
  },
];

const TEAM_CATEGORIES = [
  {
    title: "Ledning",
    members: [
      {
        name: "Simon Carlén",
        role: "CEO & CTO",
        image: "/team/Profilbild-Simon.jpg",
        linkedin: "https://www.linkedin.com/in/simon-carlén/",
        // Lägg till e-postadresserna här:
        email: "simon.carlen@campuslyan.se", 
      },
      {
        name: "Alvin Stallgård",
        role: "Chief Commercial Officer",
        image: "/team/Profilbild-Alvin.png",
        linkedin: "https://www.linkedin.com/in/alvin-stallg%C3%A5rd-346abb290/",
        email: "alvin.stallgard@campuslyan.se",
      },
      {
        name: "Viktor Kristiansson",
        role: "Head of Backend & Security",
        image: "/team/Profilbild-Viktor.jpg",
        // email: "viktor@campuslyan.se",
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
      { name: "Marco Speziale", role: "Backend Engineer" },
      { name: "Mikael Överfjord", role: "Backend Engineer" },
      { name: "Lucas Ryefalk", role: "Frontend Engineer" },
      { name: "William Jaarma", role: "Frontend Engineer" },
      { name: "Sumiya Sayeed", role: "Frontend Engineer" },
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

function MetricCard({ label, value }: Highlight) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <p className="text-4xl font-bold text-foreground mb-2">{value}</p>
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}

function ValueCardItem({ item }: { item: ValueCard }) {
  const Icon = item.icon;
  return (
    <div className="bg-card rounded-xl border border-border p-8 flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center mb-6 text-foreground">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="group flex flex-col items-center text-center">
      {/* Bild-container */}
      <div className="relative mb-6">
        <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-background shadow-lg bg-card relative z-10">
          {member.image ? (
            <Image src={member.image} alt={member.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <Users2 className="h-16 w-16" />
            </div>
          )}
        </div>
        {/* Dekorativ ring bakom */}
        <div className="absolute inset-0 rounded-full border border-primary/20 scale-110 -z-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>

      {/* Text */}
      <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
      <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">{member.role}</p>
      
      {/* Kontaktikoner (LinkedIn & Email) */}
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
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex justify-center">
              <SectionBadge text="Vår resa" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
              Byggt på Chalmers <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pop-contrast">för studenter i hela Sverige</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Vi som grundade CampusLyan är själva studenter. Efter att ha upplevt hur krångligt och otryggt det kan vara att söka bostad, bestämde vi oss för att bygga lösningen vi själva saknade.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {STATS.map((stat) => (
              <MetricCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* 2. VISION (Grå bakgrund) */}
      <section className="py-24 px-6 border-y border-border bg-background">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="Vår vision"
            title="Mer än bara en annonssida"
            description="Från en enkel idé till en nationell samlingsplats. Vi är en guide som hjälper studenter att förstå marknaden och en trygg brygga för hyresvärdar."
            center
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VALUE_CARDS.map((card, index) => (
              <ValueCardItem key={index} item={card} />
            ))}
          </div>
        </div>
      </section>

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
                {/* Kategori-rubrik med linje */}
                <div className="flex items-center mb-12">
                  <h3 className="text-2xl font-bold text-foreground mr-6">
                    {category.title}
                  </h3>
                  <div className="h-px bg-border flex-grow"></div>
                </div>

                {/* Grid av medlemmar */}
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

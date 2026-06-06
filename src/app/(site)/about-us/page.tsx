import Image from "next/image";
import {
  Users2,
  Linkedin,
  Mail,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/server";
import { localizedText } from "@/i18n/text";

// --- DATA ---
type TeamMember = { 
  name: string; 
  role: string; 
  image?: string; 
  linkedin?: string;
  email?: string;
};

const getTeamCategories = (locale: Locale) => [
  {
    title: localizedText(locale, "Ledning", "Leadership"),
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
        email: "viktor.fazlagic@campuslyan.se",
      },
    ],
  },
  {
    title: localizedText(locale, "Marknadsföring", "Marketing"),
    members: [
      { name: "Isabelle Sumner", 
        role: "Marketing Associate",
        image: "/team/Profilbild-Isabelle.jpeg",
        linkedin: "https://www.linkedin.com/in/isabelle-sumner-6a366524a/",
      },
      { name: "Linnéa Sandell", 
        role: "Marketing Associate",
        image: "/team/Profilbild-Linnea.jpg",
        linkedin: "https://www.linkedin.com/in/linnéasandell/",
      },
    ],
  },
  {
    title: localizedText(locale, "Produkt & Utveckling", "Product & Development"),
    members: [
      {
        name: "Marco Speziale",
        role: "Backend Engineer",
        image: "/team/Profilbild-Marco.jpg",
        linkedin: "https://www.linkedin.com/in/marco-speziale-1ba67a169/",
      },
      {
        name: "Mikael Överfjord",
        role: "Backend Engineer",
        image: "/team/Profilbild-Mikael.jpeg",
        linkedin: "https://www.linkedin.com/in/mikael-överfjord-ba12663a0/",
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
        image: "/team/Profilbild-Sumiya.jpg",
        linkedin: "https://www.linkedin.com/in/sumiya-sayeed-04a9319b/",
      },
    ],
  },
  
];

// --- KOMPONENTER ---

function SectionHeading({ 
  title, 
  description,
  center = false 
}: { 
  title: string; 
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl mb-16 ${center ? "mx-auto text-center" : ""}`}>
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

function MemberCard({ member, locale }: { member: TeamMember; locale: Locale }) {
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
            aria-label={localizedText(locale, `LinkedIn för ${member.name}`, `LinkedIn for ${member.name}`)}
          >
            <Linkedin className="w-5 h-5" />
          </a>
        )}
        
        {member.email && (
          <a 
            href={`mailto:${member.email}`}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={localizedText(locale, `Maila ${member.name}`, `Email ${member.name}`)}
          >
            <Mail className="w-5 h-5" />
          </a>
        )}
      </div>

    </div>
  );
}

// --- HUVUDSIDA ---

export default async function OmPage() {
  const locale = await getRequestLocale();
  const teamCategories = getTeamCategories(locale);

  return (
    <main className="main-marketing-theme min-h-screen bg-background text-foreground">
      
      {/* 1. HERO & STORY */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16 flex flex-col">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
              {localizedText(locale, "Byggt på Chalmers", "Built at Chalmers")} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pop-contrast">
                {localizedText(locale, "för studenter i hela Sverige", "for students across Sweden")}
              </span>
            </h1>
            <p className="order-4 mt-8 text-xl text-muted-foreground leading-relaxed md:order-3 md:mt-0">
              {localizedText(
                locale,
                "Vi som grundade CampusLyan är själva studenter. Efter att ha upplevt hur krångligt och otryggt det kan vara att söka bostad, bestämde vi oss för att bygga lösningen vi själva saknade.",
                "The people who founded CampusLyan are students ourselves. After experiencing how complicated and unsafe it can be to search for housing, we decided to build the solution we were missing.",
              )}
            </p>

            <div className="order-3 relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm md:order-4 md:mt-10">
              <Image
                src="/team/group.jpg"
                alt={localizedText(locale, "CampusLyan-teamet", "The CampusLyan team")}
                width={1618}
                height={911}
                sizes="(max-width: 768px) 100vw, 896px"
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. TEAM */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title={localizedText(locale, "Möt teamet", "Meet the team")}
            description={localizedText(
              locale,
              "Vi kombinerar våra erfarenheter från Chalmers med viljan att förbättra bostadsmarknaden för alla.",
              "We combine our experiences from Chalmers with the ambition to improve the housing market for everyone.",
            )}
          />

          <div className="space-y-24">
            {teamCategories.map((category) => (
              <div key={category.title}>
                <div className="flex items-center mb-12">
                  <h3 className="text-2xl font-bold text-foreground mr-6">
                    {category.title}
                  </h3>
                  <div className="h-px bg-border grow"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                  {category.members.map((member) => (
                    <MemberCard key={member.name} member={member} locale={locale} />
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

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getRequestLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  if (locale === "en") {
    return {
      title: "Privacy Policy",
      description: "Privacy Policy for CampusLyan.",
      alternates: {
        canonical: "/en/privacy-policy",
      },
    };
  }

  return {
    title: "Integritetspolicy",
    description: "Integritetspolicy för CampusLyan.",
    alternates: {
      canonical: "/privacy-policy",
    },
  };
}

export const dynamic = "force-dynamic";

const lastUpdated = "21 maj 2026";
const contactEmail = "privacy@campuslyan.se";

type PolicyTableRow = {
  id: string;
  cells: string[];
};

const dataTypeRows: PolicyTableRow[] = [
  {
    id: "profile",
    cells: [
      "Grundläggande profilinformation",
      "T.ex. namn, e-postadress, telefonnummer, adress, födelsedatum och andra kontakt- eller profiluppgifter som du anger.",
      "Användaren",
    ],
  },
  {
    id: "account",
    cells: [
      "Kontoinformation",
      "Kontoaktivitet, inloggningsuppgifter, kontoinställningar, sparade bostäder, bevakningar, intressemarkeringar, integritetsinställningar, supportfrågor och annan information kopplad till ditt användarkonto.",
      "Användaren och CampusLyans plattform",
    ],
  },
  {
    id: "student-status",
    cells: [
      "Information om studier och studentstatus",
      "T.ex. lärosäte, studieort, utbildning, antagningsbesked, studieintyg, studieomfattning eller annan information som används för att visa att du är student eller uppfyller krav för vissa studentbostäder.",
      "Användaren, verifieringstjänster och i vissa fall samarbetspartners",
    ],
  },
  {
    id: "verification",
    cells: [
      "Verifieringsuppgifter",
      "Information som används för att verifiera din identitet, studentstatus eller behörighet, exempelvis uppgifter från Freja eller annan verifieringstjänst. Det kan omfatta namn, personnummer eller annan identifieringsuppgift, verifieringsstatus, tidpunkt för verifiering och teknisk information kopplad till verifieringen.",
      "Användaren, verifieringstjänster och CampusLyans plattform",
    ],
  },
  {
    id: "housing-preferences",
    cells: [
      "Bostadspreferenser",
      "Preferenser kopplade till ditt bostadssökande, exempelvis önskad ort, lärosäte, avstånd till campus, hyresnivå, bostadstyp, storlek, inflyttningsperiod, pendlingsavstånd och andra filter eller val du gör i tjänsten.",
      "Användaren och CampusLyans plattform",
    ],
  },
  {
    id: "applications",
    cells: [
      "Intresseanmälningar och bostadsansökningar",
      "Uppgifter om bostäder du visar intresse för, anmäler intresse till, ansöker om eller skickar förfrågningar om via CampusLyan. Det kan omfatta bostadsobjekt, ort, hyresvärd, önskad inflyttningsperiod, ansökningsstatus, meddelanden och annan information som du lämnar i samband med intresseanmälan, köansökan, bostadsansökan eller förfrågan.",
      "Användaren, CampusLyans plattform och i vissa fall samarbetspartners",
    ],
  },
  {
    id: "queue-status",
    cells: [
      "Kö- och statusuppgifter",
      "Uppgifter om din befintliga eller framtida köstatus hos anslutna bostadsföretag, fastighetsägare eller samarbetspartners, exempelvis ködagar, köpoäng, köregistreringsdatum, köstatus, kömedlemskap, köhistorik och annan motsvarande information som är nödvändig för att visa eller hantera din bostadskö i CampusLyan.",
      "Användaren, bostadsföretag, fastighetsägare, samarbetspartners och CampusLyans plattform",
    ],
  },
  {
    id: "generated-content",
    cells: [
      "Användargenererat innehåll",
      "Uppgifter som du själv lämnar i fritextfält, meddelanden, supportärenden, intresseanmälningar, formulär, feedback, enkäter eller annan kommunikation med oss eller via tjänsten.",
      "Användaren",
    ],
  },
  {
    id: "communications",
    cells: [
      "Kommunikationsuppgifter",
      "Information som framgår i din korrespondens med oss, exempelvis frågor, supportärenden, feedback, klagomål, mötesanteckningar och annan kommunikation.",
      "Användaren, kontaktpersoner, samarbetspartners och CampusLyan",
    ],
  },
  {
    id: "technical",
    cells: [
      "Teknisk information",
      "IP-adress, webbläsare, operativsystem, enhet, tekniska loggar, säkerhetsloggar, sessionsinformation och information om hur du navigerar till, på och från vår webbplats eller plattform.",
      "Användaren, användarens enhet, webbläsare, CampusLyans plattform och tjänster från tredje part",
    ],
  },
  {
    id: "behavior",
    cells: [
      "Beteendeinformation på plattformen",
      "Information om vilka typer av bostäder du tittar på, sparar, filtrerar, klickar på eller visar intresse för, vilka funktioner du använder, hur länge och när du senast använde tjänsten.",
      "Användaren och CampusLyans plattform",
    ],
  },
  {
    id: "inferences",
    cells: [
      "Förmodade slutsatser om användare",
      "Förmodade intressen, bostadspreferenser och relevanta rekommendationer baserat på profilinformation, beteendeinformation och användning av tjänsten över tid.",
      "CampusLyans plattform",
    ],
  },
  {
    id: "location",
    cells: [
      "Platsdata",
      "Uppgifter om användarens geografiska position (platsinformation) från GPS-data och IP-adress i användarens enheter.",
      "Användaren, användarens enhet och tjänster från tredje part",
    ],
  },
  {
    id: "b2b",
    cells: [
      "B2B-klientinformation",
      "För bostadsföretag, fastighetsägare, studentkårer, fastighetssystem, leverantörer och andra samarbetspartners samlar vi in uppgifter om företag, organisation, affärsroll, kontaktuppgifter, avtalsrelaterade uppgifter, kommunikation och kundrelation.",
      "Företagskunder, samarbetspartners, kontaktpersoner och publika källor",
    ],
  },
  {
    id: "compliance",
    cells: [
      "Information för regelefterlevnad",
      "Information som behövs för att uppfylla rättsliga skyldigheter, hantera avtalsförhållanden, säkerställa tillräcklig kund- och leverantörsinformation, bokföring, rättighetsförfrågningar och andra krav enligt lag.",
      "Användaren, samarbetspartners, leverantörer, publika källor och myndigheter",
    ],
  },
  {
    id: "recruiting",
    cells: [
      "Rekryteringsinformation",
      "CV, personligt brev, betyg, utbildning, arbetslivserfarenhet, intervjuanteckningar, referenser och annan information som du lämnar i samband med en rekryteringsprocess.",
      "Den arbetssökande och referenser",
    ],
  },
  {
    id: "cookies",
    cells: [
      "Kakor och lokal lagringsinformation",
      "När du använder våra tjänster kan vi använda kakor, pixlar och liknande teknik för att känna igen dig, hålla dig inloggad, analysera användning, förbättra tjänsten, mäta resultat och anpassa marknadsföring.",
      "Användarens enhet, webbläsare, CampusLyans plattform och tjänster från tredje part",
    ],
  },
];

const processingPurposeRows: PolicyTableRow[] = [
  {
    id: "provide-platform",
    cells: [
      "Tillhandahålla CampusLyans plattform",
      "CampusLyan ger dig tillgång till en plattform där du kan söka efter studentbostäder, se bostadsköer, skapa konto, spara bostäder, skapa bevakningar, anmäla intresse och kommunicera med oss. För att kunna leverera dessa tjänster behöver vi behandla dina personuppgifter.",
      "Fullgörande av avtal",
    ],
  },
  {
    id: "account",
    cells: [
      "Skapa och administrera användarkonto",
      "Vi behandlar kontouppgifter för att skapa och administrera ditt konto, hantera inloggning, inställningar, sparade bostäder, intresseanmälningar, kööversikt, historik och andra kontofunktioner.",
      "Fullgörande av avtal",
    ],
  },
  {
    id: "search-filter-watch",
    cells: [
      "Söka, filtrera och bevaka bostäder",
      "Vi behandlar bostadspreferenser och användningsdata för att du ska kunna hitta relevanta bostäder, använda filter, spara sökningar, skapa bevakningar och få notifieringar om bostäder som matchar dina val.",
      "Fullgörande av avtal och berättigat intresse",
    ],
  },
  {
    id: "applications",
    cells: [
      "Anmäla intresse, ansöka om bostad eller skicka förfrågningar",
      "När du själv initierar en intresseanmälan, köansökan, bostadsansökan eller annan förfrågan behandlar vi de uppgifter som behövs för att hantera eller förmedla den till relevant bostadsföretag, fastighetsägare eller samarbetspartner.",
      "Fullgörande av avtal",
    ],
  },
  {
    id: "forwarding",
    cells: [
      "Vidareförmedling till externa bostadsaktörer",
      "Om en bostad eller kö hanteras av en extern part kan vi länka dig vidare till den partens webbplats eller, när funktionen stödjer det och du initierar det, överföra nödvändig information till den parten. Den externa parten ansvarar för sin fortsatta behandling.",
      "Fullgörande av avtal och berättigat intresse",
    ],
  },
  {
    id: "queue-status",
    cells: [
      "Visa och hantera köstatus",
      "Om du aktivt begär, godkänner eller initierar sådan funktion kan vi hämta, ta emot, visa och administrera uppgifter om din köstatus hos anslutna bostadsföretag, fastighetsägare eller samarbetspartners.",
      "Fullgörande av avtal",
    ],
  },
  {
    id: "verification",
    cells: [
      "Student- och identitetsverifiering",
      "För att tillhandahålla en trygg och relevant plattform kan vi behandla uppgifter för att verifiera din identitet, studentstatus eller behörighet, exempelvis genom Freja eller annan verifieringstjänst.",
      "Fullgörande av avtal och berättigat intresse",
    ],
  },
  {
    id: "security",
    cells: [
      "Tillhandahålla en säker och trygg plattform",
      "Det är viktigt för oss att säkerställa att CampusLyan är en säker och tillförlitlig tjänst. Därför behandlar vi uppgifter för att förebygga obehörig åtkomst, falska konton, bedrägerier, tekniska angrepp, missbruk av tjänsten och handlingar som strider mot våra villkor.",
      "Berättigat intresse",
    ],
  },
  {
    id: "notifications",
    cells: [
      "Meddelanden, notifieringar och påminnelser",
      "Vi kan skicka bekräftelser, notifieringar, påminnelser och annan information om ditt konto, dina bevakningar, intresseanmälningar, köuppgifter, bostadsförslag eller användning av plattformen.",
      "Fullgörande av avtal och berättigat intresse",
    ],
  },
  {
    id: "support",
    cells: [
      "Förfrågningar och kundtjänst",
      "Om du kontaktar oss behandlar vi dina personuppgifter för att hjälpa dig med frågor, supportärenden, feedback, klagomål och andra ärenden.",
      "Fullgörande av avtal och berättigat intresse",
    ],
  },
  {
    id: "improve-service",
    cells: [
      "Förbättra tjänsten",
      "Vi registrerar och analyserar hur CampusLyan används för att förstå vilka funktioner som fungerar bra, vilka som behöver förbättras och hur vi kan utveckla tjänsten för studenter, bostadssökande och samarbetspartners.",
      "Berättigat intresse",
    ],
  },
  {
    id: "personalization",
    cells: [
      "Personalisering och rekommendationer",
      "Vi kan använda profilinformation, bostadspreferenser och beteendeinformation för att visa mer relevanta bostäder, köer, rekommendationer, påminnelser och innehåll i tjänsten.",
      "Berättigat intresse och, när det krävs, samtycke",
    ],
  },
  {
    id: "product-development",
    cells: [
      "Användarundersökningar och produktutveckling",
      "Vi kan behandla kontaktuppgifter och användningsdata för att genomföra enkäter, användartester och produktutvecklingsprojekt.",
      "Berättigat intresse",
    ],
  },
  {
    id: "marketing",
    cells: [
      "Marknadsföring till användare",
      "Vi kan skicka tips, nyheter, erbjudanden och information om CampusLyan eller relevanta bostadsrelaterade tjänster. Du kan alltid tacka nej till direktmarknadsföring via avregistreringslänk, kontoinställningar om sådan funktion finns eller genom att kontakta oss.",
      "Berättigat intresse och, när det krävs, samtycke",
    ],
  },
  {
    id: "ads-measurement",
    cells: [
      "Digital annonsering och mätning",
      "Vi kan använda cookies, pixlar och liknande teknik för att mäta och anpassa marknadsföring i digitala kanaler, exempelvis sociala medier, sökmotorer och annonseringsplattformar.",
      "Samtycke när sådant krävs",
    ],
  },
  {
    id: "b2b",
    cells: [
      "B2B-kontakter och samarbetspartners",
      "Vi behandlar kontaktuppgifter och företagsuppgifter för att marknadsföra våra tjänster till potentiella kunder och samarbetspartners, ingå och förvalta avtal, tillhandahålla support, anordna möten, följa upp samarbeten och utveckla affärsrelationer.",
      "Berättigat intresse och, i vissa fall, fullgörande av avtal",
    ],
  },
  {
    id: "recruiting",
    cells: [
      "Rekrytering",
      "Vi behandlar personuppgifter för att genomföra och administrera rekryteringsprocesser, bedöma kandidater och kontakta referenser.",
      "Berättigat intresse och, för framtida rekryteringar, samtycke",
    ],
  },
  {
    id: "legal-obligations",
    cells: [
      "Uppfyllande av rättsliga förpliktelser",
      "Vi behandlar personuppgifter när det krävs för att uppfylla rättsliga skyldigheter, exempelvis bokföring, myndighetsförfrågningar, skattekrav och hantering av registrerades rättigheter.",
      "Rättslig förpliktelse",
    ],
  },
  {
    id: "legal-claims",
    cells: [
      "Rättsliga anspråk och tvister",
      "Vi kan behandla uppgifter för att fastställa, göra gällande eller försvara rättsliga anspråk.",
      "Berättigat intresse",
    ],
  },
  {
    id: "transactions",
    cells: [
      "Företagstransaktioner",
      "Vid eventuell sammanslagning, företagsöverlåtelse, investering, finansiering eller verksamhetsövergång kan personuppgifter behandlas och överföras i den utsträckning det är nödvändigt för transaktionen.",
      "Berättigat intresse",
    ],
  },
];

const retentionRows: PolicyTableRow[] = [
  {
    id: "account-profile",
    cells: [
      "Kontouppgifter och profiluppgifter",
      "Så länge kontot är aktivt och därefter normalt upp till tolv (12) månader.",
    ],
  },
  {
    id: "saved-housing",
    cells: [
      "Sparade bostäder, bevakningar och bostadspreferenser",
      "Så länge kontot är aktivt och därefter normalt upp till tolv (12) månader.",
    ],
  },
  {
    id: "applications",
    cells: [
      "Intresseanmälningar, köansökningar, bostadsansökningar och förfrågningar",
      "Så länge kontot är aktivt och därefter normalt upp till tjugofyra (24) månader.",
    ],
  },
  {
    id: "queue-status",
    cells: [
      "Kö- och statusuppgifter",
      "Så länge funktionen är aktiv eller så länge kontot är aktivt, och därefter normalt upp till tolv (12) månader.",
    ],
  },
  {
    id: "verification-status",
    cells: [
      "Verifieringsstatus",
      "Så länge kontot är aktivt eller så länge verifieringen behövs för aktuell funktion, och därefter normalt upp till tolv (12) månader.",
    ],
  },
  {
    id: "student-documents",
    cells: [
      "Underlag som styrker studentstatus eller behörighet",
      "Endast så länge det behövs för kontrollen och normalt inte längre än sex (6) månader efter genomförd kontroll, om inte längre lagring krävs.",
    ],
  },
  {
    id: "support",
    cells: [
      "Supportärenden och kommunikation",
      "Normalt upp till tjugofyra (24) månader efter avslutat ärende.",
    ],
  },
  {
    id: "technical-logs",
    cells: [
      "Tekniska loggar och säkerhetsloggar",
      "Normalt upp till tolv (12) månader.",
    ],
  },
  {
    id: "marketing",
    cells: [
      "Marknadsföringsuppgifter",
      "Upp till två (2) år från din senaste användning av CampusLyan eller senaste kontakt med oss, om du inte dessförinnan motsätter dig behandlingen eller återkallar ett lämnat samtycke.",
    ],
  },
  {
    id: "partner-contacts",
    cells: [
      "Kontaktpersoner hos bostadsföretag, fastighetsägare, studentkårer, fastighetssystem och samarbetspartners",
      "Så länge du är angiven som kontaktperson för en organisation som har en affärsrelation med CampusLyan och normalt ett (1) år därefter. För potentiella kunder och samarbetspartners sparas uppgifter normalt i två (2) år.",
    ],
  },
  {
    id: "agreements",
    cells: [
      "Avtal och avtalsrelaterade uppgifter",
      "Om dina personuppgifter förekommer i ett avtal sparas uppgifterna normalt under tio (10) år från det att avtalet löpt ut eller sagts upp.",
    ],
  },
  {
    id: "recruiting",
    cells: [
      "Rekryteringsuppgifter",
      "Under rekryteringsprocessen och normalt två (2) år därefter. Om du har samtyckt till framtida rekryteringar kan uppgifterna sparas längre enligt ditt samtycke.",
    ],
  },
  {
    id: "accounting",
    cells: [
      "Räkenskapsinformation",
      "Till och med det sjunde (7) året efter utgången av det kalenderår då räkenskapsåret avslutades, enligt bokföringslagstiftning.",
    ],
  },
  {
    id: "rights-requests",
    cells: [
      "Begäran om att utöva rättigheter",
      "Normalt ett (1) år efter att vi hanterat din begäran.",
    ],
  },
  {
    id: "legal-claims",
    cells: [
      "Uppgifter vid rättsligt anspråk eller tvist",
      "Så länge anspråket är aktuellt eller tvisten pågår och därefter så länge det är nödvändigt för att tillvarata våra rättsliga intressen.",
    ],
  },
];

function Paragraph({ children }: { children: ReactNode }) {
  return <p className="text-base leading-8 text-muted-foreground">{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border pb-8 last:border-b-0">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Subheading({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-foreground">{children}</h3>;
}

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="font-medium text-foreground underline underline-offset-4" href={href}>
      {children}
    </a>
  );
}

function ContactCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-base leading-8 text-muted-foreground">
      <p>CampusLyan Nordics AB, org.nr. 559587-0048</p>
      <p>Landsvägsgatan 19, 413 04 Göteborg, Sverige</p>
      <p>
        <InlineLink href={`mailto:${contactEmail}`}>{contactEmail}</InlineLink>
      </p>
    </div>
  );
}

function PolicyTable({ columns, rows }: { columns: string[]; rows: PolicyTableRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead className="bg-muted/60 text-foreground">
          <tr>
            {columns.map((column) => (
              <th className="border-b border-border px-4 py-3 font-semibold" key={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-muted-foreground">
          {rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell, index) => (
                <td
                  className={
                    index === 0
                      ? "px-4 py-4 align-top font-medium text-foreground"
                      : "px-4 py-4 align-top"
                  }
                  key={`${row.id}-${index}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EnglishPrivacyPage() {
  const dataRows: PolicyTableRow[] = [
    {
      id: "profile",
      cells: ["Profile information", "Name, email address, phone number, address, date of birth and other contact or profile details you provide.", "You"],
    },
    {
      id: "account",
      cells: ["Account information", "Account activity, login details, settings, saved homes, watchlists, interest registrations and support questions.", "You and the CampusLyan platform"],
    },
    {
      id: "verification",
      cells: ["Verification information", "Information used to verify identity, student status or eligibility, for example information from Freja or another verification service.", "You, verification services and CampusLyan"],
    },
    {
      id: "technical",
      cells: ["Technical information", "IP address, browser, operating system, device information, logs, sessions and information about how you use the website.", "Your device, browser, CampusLyan and third-party services"],
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="pb-20 pt-10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/en" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              ← Back to homepage
            </Link>
          </div>

          <header className="mb-12 border-b border-border pb-8">
            <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">CampusLyan</p>
            <h1 className="text-4xl font-bold text-foreground md:text-6xl">Privacy Policy</h1>
            <p className="mt-4 text-sm font-medium text-muted-foreground">Last updated: 21 May 2026</p>
            <div className="mt-6 space-y-4">
              <Paragraph>
                This privacy policy explains how CampusLyan processes personal data within CampusLyan's website, platform and related services.
              </Paragraph>
              <Paragraph>
                CampusLyan provides a student-focused housing platform that brings student housing, housing queues and housing-related information together in one place.
              </Paragraph>
            </div>
          </header>

          <div className="space-y-8">
            <PolicySection title="Controller">
              <Paragraph>
                CampusLyan Nordics AB is responsible for the processing of personal data within the CampusLyan website, platform and related services unless otherwise stated.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Personal Data We Process">
              <PolicyTable columns={["Category", "Examples", "Source"]} rows={dataRows} />
            </PolicySection>

            <PolicySection title="Purposes and Legal Bases">
              <Paragraph>
                We process personal data to create and manage accounts, provide housing search features, manage saved listings and applications, verify eligibility, communicate with users, maintain security, improve the service and comply with legal obligations.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Sharing">
              <Paragraph>
                We may share personal data with service providers, verification providers, partner housing actors or authorities when necessary for the purposes described in this policy or when required by law.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Storage and Rights">
              <Paragraph>
                We keep personal data only for as long as needed for the relevant purpose or as required by law. You may request access, rectification, erasure, restriction, portability or object to processing where applicable under GDPR.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Contact">
              <Paragraph>
                Questions about privacy can be sent to <InlineLink href={`mailto:${contactEmail}`}>{contactEmail}</InlineLink>.
              </Paragraph>
            </PolicySection>
          </div>
        </div>
      </section>
    </main>
  );
}

export default async function IntegritetspolicyPage() {
  const locale = await getRequestLocale();

  if (locale === "en") {
    return <EnglishPrivacyPage />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="pb-20 pt-10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <header className="mb-12 border-b border-border pb-8">
            <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              CampusLyan
            </p>
            <h1 className="text-4xl font-bold text-foreground md:text-6xl">
              Integritetspolicy
            </h1>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Senast uppdaterad: {lastUpdated}
            </p>
            <div className="mt-6 space-y-4">
              <Paragraph>
                Denna personuppgiftspolicy beskriver hur CampusLyan behandlar
                personuppgifter inom CampusLyans webbplats, plattform och
                tillhörande tjänster.
              </Paragraph>
              <Paragraph>
                CampusLyan tillhandahåller en studentfokuserad bostadsplattform
                som samlar studentbostäder, bostadsköer och bostadsrelaterad
                information på en plats. Plattformen hjälper studenter och andra
                bostadssökande att hitta, bevaka och anmäla intresse för
                bostäder samt att få en bättre överblick över relevanta
                bostadsköer och bostadsaktörer.
              </Paragraph>
            </div>
          </header>

          <div className="space-y-8">
            <PolicySection title="Personuppgiftspolicy för CampusLyans tjänster">
              <Paragraph>
                CampusLyan AB ("CampusLyan", "vi", "oss" eller "vår") ansvarar
                för behandlingen av personuppgifter inom CampusLyans webbplats,
                plattform och tillhörande tjänster, om inte annat anges i denna
                personuppgiftspolicy.
              </Paragraph>
              <Paragraph>
                Anslutna bostadsföretag, fastighetsägare, studentkårer och
                andra samarbetspartners kan genom CampusLyan tillgängliggöra
                information, synliggöra bostäder och nå ut till relevanta
                studentgrupper. CampusLyan är dock inte hyresvärd, förmedlar
                inte hyresavtal i eget namn och fattar inte beslut om vem som får
                en bostad.
              </Paragraph>
              <Paragraph>
                Anslutna bostadsföretag, fastighetsägare och andra
                samarbetspartners är normalt självständigt personuppgiftsansvariga
                för den behandling av personuppgifter som sker inom ramen för
                deras egna bostadsköer, uthyrningsprocesser, urval, erbjudanden,
                hyresavtal, kundrelationer och system. Vänligen kontakta
                respektive bostadsföretag, fastighetsägare eller samarbetspartner
                för information om hur den parten behandlar dina personuppgifter.
              </Paragraph>
              <Paragraph>
                När CampusLyan endast visar information om en bostad, en
                bostadskö eller en samarbetspartner och länkar dig vidare till en
                extern webbplats, ansvarar den externa parten för den insamling
                och behandling av personuppgifter som sker där. När du däremot
                använder CampusLyans egna funktioner, exempelvis konto, sparade
                bostäder, bevakningar, kööversikt, verifiering,
                intresseanmälningar eller kommunikation via plattformen, ansvarar
                CampusLyan för den behandling som sker inom våra egna tjänster.
              </Paragraph>
              <Paragraph>
                Vi säkerställer att dina personuppgifter är skyddade och att
                behandlingen sker i enlighet med gällande lagar,
                dataskyddsregler samt våra interna riktlinjer och processer. Vi
                vidtar tekniska och organisatoriska säkerhetsåtgärder för att
                skydda dina personuppgifter mot obehörig åtkomst, förlust,
                förändring eller otillåten behandling.
              </Paragraph>
              <Paragraph>
                I denna personuppgiftspolicy beskriver vi hur vi behandlar
                personuppgifter när du använder CampusLyan, skapar konto, söker
                eller bevakar bostäder, anmäler intresse för bostäder, använder
                funktioner för bostadsköer eller studentverifiering, kontaktar
                oss, företräder ett bostadsföretag, en fastighetsägare, en
                studentkår, ett fastighetssystem eller annan samarbetspartner,
                eller söker jobb hos oss. Om du är kontaktperson, företrädare,
                medsökande, referensperson eller på annat sätt berörs av våra
                tjänster gäller samma principer för dig i tillämpliga delar.
              </Paragraph>
              <Subheading>Fullständig information om den personuppgiftsansvarige</Subheading>
              <ContactCard />
            </PolicySection>

            <PolicySection title="Vilken information behandlar vi om dig?">
              <PolicyTable
                columns={["Datatyp", "Beskrivning", "Källa"]}
                rows={dataTypeRows}
              />
              <Paragraph>
                Vi ber dig att inte lämna känsliga personuppgifter, såsom
                uppgifter om hälsa, religion, politiska åsikter, fackligt
                medlemskap eller liknande, i fritextfält, meddelanden eller
                supportärenden till oss, om vi inte uttryckligen efterfrågar
                sådana uppgifter.
              </Paragraph>
            </PolicySection>

            <PolicySection title="För vilka syften behandlar vi dina uppgifter?">
              <Paragraph>
                Vi använder den information vi samlar in om dig och andra
                användare för att tillhandahålla, utveckla, förbättra och skydda
                CampusLyans tjänster. Här beskrivs de syften för vilka
                CampusLyan behandlar personuppgifter.
              </Paragraph>
              <Paragraph>
                För att uppnå vissa syften kan vi använda automatiserade
                verktyg, statistik, analys och AI-baserade funktioner för att
                exempelvis förbättra sökresultat, rekommendationer, matchning,
                support, säkerhet och produktutveckling. I den mån
                personuppgifter används för analys eller modellförbättring
                arbetar vi för att begränsa, avidentifiera eller pseudonymisera
                uppgifterna när det är möjligt.
              </Paragraph>
              <Paragraph>
                CampusLyan använder inte automatiserat beslutsfattande för att
                besluta vem som får en bostad. Alla beslut om köplacering, urval,
                erbjudanden, tilldelning av bostad och hyresavtal fattas av det
                aktuella bostadsföretaget, fastighetsägaren eller
                samarbetspartnern enligt deras egna regler, krav och processer.
              </Paragraph>
              <PolicyTable
                columns={["Behandlingsändamål", "Beskrivning", "Rättslig grund"]}
                rows={processingPurposeRows}
              />
            </PolicySection>

            <PolicySection title="Hur länge sparar vi dina uppgifter?">
              <Paragraph>
                Vi sparar personuppgifter så länge det är nödvändigt för de
                ändamål som beskrivs i denna personuppgiftspolicy. Därefter
                raderas eller anonymiseras uppgifterna, om vi inte behöver spara
                dem längre enligt lag, för säkerhet, för att förebygga missbruk
                eller för att fastställa, göra gällande eller försvara rättsliga
                anspråk.
              </Paragraph>
              <PolicyTable columns={["Typ av uppgift", "Lagringstid"]} rows={retentionRows} />
            </PolicySection>

            <PolicySection title="Var behandlar vi dina personuppgifter?">
              <Paragraph>
                Vi strävar alltid efter att dina personuppgifter ska behandlas
                inom EU/EES och att våra egna IT-system ska finnas tillgängliga
                inom EU/EES.
              </Paragraph>
              <Subheading>Överföring till leverantörer i tredjeländer</Subheading>
              <Paragraph>
                Vissa av våra leverantörer eller underleverantörer kan ha hela
                eller delar av sin verksamhet i länder utanför EU/EES, så
                kallade tredjeländer. Oavsett vilket land dina personuppgifter
                behandlas i vidtar vi juridiska, tekniska och organisatoriska
                åtgärder för att säkerställa en skyddsnivå som motsvarar kraven
                enligt dataskyddslagstiftningen.
              </Paragraph>
              <Paragraph>
                Vid överföringar till länder utanför EU/EES använder vi lämpliga
                skyddsåtgärder enligt GDPR. Det kan exempelvis innebära att vi
                stödjer oss på EU-kommissionens adekvansbeslut,
                EU-kommissionens standardavtalsklausuler eller andra godkända
                överföringsmekanismer. Vid behov vidtar vi även kompletterande
                skyddsåtgärder.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Dina rättigheter">
              <Paragraph>
                Du har rätt att veta vad vi gör med dina personuppgifter. Du har
                också rätt att få tillgång till dina personuppgifter och i vissa
                fall få dem rättade, raderade eller begränsade. Nedan listar vi
                vilka rättigheter du har och hur du kan använda dem.
              </Paragraph>
              <Paragraph>
                Varje personuppgiftsansvarig ansvarar för sin egen behandling.
                Om din begäran avser ett bostadsföretags, en fastighetsägares
                eller annan samarbetspartners behandling av personuppgifter,
                exempelvis uppgifter som redan har överförts till den parten
                eller uppgifter som finns i den partens egna system, behöver du
                normalt kontakta den parten direkt.
              </Paragraph>

              <Subheading>Få tillgång till dina personuppgifter</Subheading>
              <Paragraph>
                Vi är öppna och transparenta med vilken information vi behandlar
                om dig. Om du har ett användarkonto hos CampusLyan kan du logga
                in för att få en översikt över viss information som finns
                registrerad om dig, exempelvis kontaktuppgifter, sparade
                bostäder, bevakningar och aktuella eller tidigare
                intresseanmälningar, i den mån sådan funktion finns.
              </Paragraph>
              <Paragraph>
                Om du vill få en mer detaljerad inblick i vilka personuppgifter
                vi behandlar om dig kan du begära tillgång till dessa uppgifter,
                ett så kallat registerutdrag. Du kan begära ett sådant
                registerutdrag genom att kontakta oss. Eftersom vi har en
                skyldighet att skydda dina personuppgifter från obehörig åtkomst
                kommer vi endast att lämna ut sådana uppgifter som vi med
                säkerhet vet tillhör dig.
              </Paragraph>

              <Subheading>Radera uppgifter</Subheading>
              <Paragraph>
                I vissa fall har du rätt att få dina personuppgifter raderade,
                exempelvis om personuppgifterna inte längre är nödvändiga för de
                ändamål för vilka de samlades in, om du återkallar ett samtycke
                och det inte finns någon annan rättslig grund för behandlingen,
                eller om uppgifterna har behandlats olagligt.
              </Paragraph>
              <Paragraph>
                Om du begär att vi raderar ditt konto eller dina personuppgifter
                hos CampusLyan ansvarar vi för att radera eller anonymisera de
                personuppgifter som CampusLyan är personuppgiftsansvarig för, om
                vi inte behöver spara uppgifterna enligt lag, för säkerhet, för
                att förebygga missbruk eller för att tillvarata våra rättsliga
                intressen.
              </Paragraph>
              <Paragraph>
                Radering hos CampusLyan innebär inte automatiskt att
                personuppgifter som redan har överförts till ett bostadsföretag,
                en fastighetsägare eller annan samarbetspartner raderas hos den
                parten. Det innebär inte heller automatiskt att köuppgifter som
                finns i den partens system raderas. Om du vill utöva dina
                rättigheter avseende den partens behandling behöver du kontakta
                den parten direkt.
              </Paragraph>
              <Paragraph>
                Om vi har anledning att tro att ett konto har använts i strid
                med våra villkor kan vi i vissa fall behålla begränsad
                information under en rimlig tid efter radering i syfte att
                upptäcka, utreda och förhindra missbruk av våra tjänster.
              </Paragraph>

              <Subheading>Begär rättelse av personuppgifter</Subheading>
              <Paragraph>
                Om du anser att informationen om dig är felaktig eller
                ofullständig har du rätt att begära att uppgifterna rättas eller
                kompletteras. Om du har ett användarkonto kan du själv uppdatera
                viss information genom att logga in på ditt konto och ändra dina
                kontoinställningar, i den mån sådan funktion finns. Om din
                begäran gäller andra uppgifter kan du kontakta oss.
              </Paragraph>

              <Subheading>Säg nej till direktmarknadsföring</Subheading>
              <Paragraph>
                Du kan när som helst säga nej till sådan behandling av
                personuppgifter som CampusLyan gör för direktmarknadsföring,
                exempelvis utskick via e-post. Du kan avregistrera dig genom att
                klicka på en länk i utskicket, ändra dina inställningar i
                tjänsten om sådan funktion finns eller genom att kontakta oss.
              </Paragraph>

              <Subheading>Invänd mot behandling baserad på vårt berättigade intresse</Subheading>
              <Paragraph>
                Du har rätt att invända mot behandling av dina personuppgifter
                som vi gör med stöd av vårt berättigade intresse. Om du invänder
                mot sådan behandling kan vi endast fortsätta behandlingen om vi
                kan visa att det finns tvingande berättigade skäl för att
                personuppgifterna måste behandlas och att dessa väger tyngre än
                dina intressen, rättigheter och friheter.
              </Paragraph>
              <Paragraph>
                Om du invänder mot viss behandling av personuppgifter gör vi en
                bedömning av bland annat dina rimliga förväntningar, vilken typ
                av uppgifter behandlingen gäller, vilka skyddsåtgärder som finns
                och vilka för- och nackdelar behandlingen innebär för dig,
                CampusLyan, andra användare och eventuella tredje parter.
              </Paragraph>

              <Subheading>Begränsa behandlingen av uppgifter</Subheading>
              <Paragraph>
                Du har rätt att begära att vår behandling av dina personuppgifter
                begränsas i vissa situationer, exempelvis om du anser att
                uppgifterna är felaktiga, om behandlingen är olaglig men du inte
                vill att uppgifterna raderas, eller om du har invänt mot
                behandling som baseras på berättigat intresse.
              </Paragraph>
              <Paragraph>
                Om du begär att behandlingen av dina uppgifter ska begränsas kan
                det innebära att vissa funktioner i CampusLyan inte kan användas
                under tiden som behandlingen är begränsad.
              </Paragraph>

              <Subheading>Dataportabilitet</Subheading>
              <Paragraph>
                Du har i vissa fall rätt att få en kopia av dina personuppgifter
                i ett strukturerat, allmänt använt och maskinläsbart format.
                Rätten till dataportabilitet omfattar endast uppgifter som du
                själv har tillhandahållit oss och som vi behandlar automatiserat
                för att fullgöra ett avtal med dig eller med stöd av ditt
                samtycke.
              </Paragraph>

              <Subheading>Återkalla samtycke</Subheading>
              <Paragraph>
                Om vi behandlar personuppgifter med stöd av ditt samtycke har du
                rätt att när som helst återkalla samtycket. Ett återkallande
                påverkar inte lagligheten av vår behandling innan samtycket
                återkallades.
              </Paragraph>

              <Subheading>Invänd mot automatiserade beslut</Subheading>
              <Paragraph>
                Du har rättigheter enligt GDPR om du blir föremål för ett beslut
                som enbart grundas på automatiserad behandling och som har
                rättsliga följder för dig eller på liknande sätt i betydande grad
                påverkar dig.
              </Paragraph>
              <Paragraph>
                CampusLyan använder inte automatiserat beslutsfattande för att
                besluta vem som får en bostad. Om vi i framtiden skulle använda
                automatiserat beslutsfattande som omfattas av särskilda regler
                enligt GDPR kommer vi att informera dig om detta och säkerställa
                att det finns stöd enligt lag.
              </Paragraph>

              <Subheading>Kontakta oss angående dina rättigheter</Subheading>
              <Paragraph>
                Om du vill utöva någon av dina rättigheter kan du kontakta oss
                via e-post på{" "}
                <InlineLink href={`mailto:${contactEmail}`}>{contactEmail}</InlineLink>.
                Vi kommer att besvara din begäran så snart som möjligt och
                senast inom den tid som följer av gällande dataskyddslagstiftning.
              </Paragraph>

              <Subheading>Kontakta tillsynsmyndigheten</Subheading>
              <Paragraph>
                Om du anser att CampusLyan hanterar personuppgifter felaktigt har
                du rätt att lämna in ett klagomål till tillsynsmyndigheten för
                dataskydd.
              </Paragraph>
              <Paragraph>
                Integritetsskyddsmyndigheten, IMY, är svensk tillsynsmyndighet
                för dataskydd. Du hittar mer information på{" "}
                <InlineLink href="https://www.imy.se">imy.se</InlineLink>.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Till vem kan personuppgifter lämnas ut?">
              <Paragraph>
                Vi delar information om dig med vissa tredje parter när det är
                nödvändigt för att tillhandahålla våra tjänster, när det krävs
                enligt lag eller när du själv har begärt eller godkänt sådan
                delning. Här kan du läsa mer om vem vi lämnar ut personuppgifter
                till.
              </Paragraph>

              <Subheading>Bostadsföretag, fastighetsägare och andra bostadsaktörer</Subheading>
              <Paragraph>
                När du aktivt väljer att lämna en intresseanmälan, köansökan,
                bostadsansökan eller annan förfrågan till ett anslutet
                bostadsföretag, en fastighetsägare eller annan bostadsaktör
                genom CampusLyan kan vi överföra de personuppgifter som är
                nödvändiga för att mottagaren ska kunna hantera din förfrågan.
              </Paragraph>
              <Paragraph>
                Det kan exempelvis omfatta namn, kontaktuppgifter,
                verifieringsstatus, studentstatus, uppgifter om den bostad du är
                intresserad av, meddelanden och andra uppgifter som är
                nödvändiga för att mottagaren ska kunna hantera intresseanmälan,
                bostadsansökan, köansökan, urval, erbjudande om bostad eller
                fortsatt uthyrningsprocess.
              </Paragraph>
              <Paragraph>
                CampusLyan beslutar inte vem som får en bostad och gör inte det
                slutliga urvalet i uthyrningsprocessen. Det aktuella
                bostadsföretaget, fastighetsägaren eller samarbetspartnern
                ansvarar själv för sin bostadskö, sina krav, sitt urval, sina
                erbjudanden, sin avtalshantering och sin fortsatta behandling av
                personuppgifter.
              </Paragraph>
              <Paragraph>
                Efter att uppgifterna har mottagits behandlar bostadsföretaget,
                fastighetsägaren eller samarbetspartnern normalt uppgifterna som
                självständig personuppgiftsansvarig enligt sin egen
                integritetspolicy.
              </Paragraph>

              <Subheading>Hämtning av köuppgifter från bostadsföretag, fastighetsägare och samarbetspartners</Subheading>
              <Paragraph>
                Om du aktivt begär, godkänner eller initierar det kan CampusLyan
                hämta eller ta emot uppgifter om din befintliga köstatus hos ett
                anslutet bostadsföretag, en fastighetsägare eller annan
                samarbetspartner. Sådana uppgifter kan exempelvis avse ködagar,
                köpoäng, köregistreringsdatum, köstatus, kömedlemskap eller
                annan motsvarande information som är nödvändig för funktionen.
              </Paragraph>
              <Paragraph>
                CampusLyan behandlar sådana uppgifter för att visa din köstatus i
                plattformen, ge dig en översikt över dina bostadsköer, möjliggöra
                bevakning, påminnelser, matchning och annan funktionalitet
                kopplad till ditt bostadssökande.
              </Paragraph>

              <Subheading>Externa webbplatser och vidare hänvisning</Subheading>
              <Paragraph>
                Om CampusLyan endast länkar dig vidare till ett bostadsföretags,
                en fastighetsägares eller en samarbetspartners egen webbplats,
                och du själv lämnar dina uppgifter direkt till den parten,
                ansvarar den parten själv för insamlingen och den fortsatta
                behandlingen av dina personuppgifter.
              </Paragraph>

              <Subheading>Leverantörer som behandlar personuppgifter för vår räkning</Subheading>
              <Paragraph>
                Vi behöver ibland anlita leverantörer för att leverera våra
                tjänster till dig. Sådana leverantörer kan exempelvis leverera
                molntjänster, datalagring, e-postutskick, pushnotiser,
                analysverktyg, supportverktyg, säkerhetslösningar, utveckling,
                drift, fakturering och bokföring.
              </Paragraph>
              <Paragraph>
                Vi är ansvariga för den behandling av personuppgifter som sker av
                våra personuppgiftsbiträden för vår räkning. Leverantörerna får
                endast behandla personuppgifter enligt våra instruktioner och får
                inte använda uppgifterna för egna ändamål.
              </Paragraph>

              <Subheading>Verifieringstjänster</Subheading>
              <Paragraph>
                Vi kan dela personuppgifter med leverantörer av
                verifieringstjänster, exempelvis Freja eller annan motsvarande
                tjänst, i den utsträckning det är nödvändigt för att verifiera
                identitet, studentstatus eller behörighet. Verifieringstjänsten
                kan även behandla personuppgifter som självständig
                personuppgiftsansvarig enligt sina egna villkor och sin egen
                integritetspolicy.
              </Paragraph>

              <Subheading>Studentkårer och samarbetspartners</Subheading>
              <Paragraph>
                Om du använder funktioner, kampanjer eller tjänster som
                tillhandahålls tillsammans med studentkårer eller andra
                samarbetspartners kan vi dela de uppgifter som är nödvändiga för
                att tillhandahålla funktionen eller samarbetet. Vi ingår avtal
                för att säkerställa att sådana samarbetspartners behandlar
                personuppgifter i enlighet med gällande dataskyddslagstiftning.
              </Paragraph>

              <Subheading>Myndigheter</Subheading>
              <Paragraph>
                Vi lämnar ut personuppgifter till myndigheter, domstolar eller
                andra mottagare om vi är skyldiga att göra det enligt lag,
                myndighetsbeslut eller domstolsbeslut. Vi kan även lämna ut
                uppgifter när det är nödvändigt för att tillvarata våra rättsliga
                intressen eller bidra till en pågående utredning där det finns
                rättsligt stöd.
              </Paragraph>

              <Subheading>Rådgivare, investerare och andra mottagare vid företagstransaktioner</Subheading>
              <Paragraph>
                Om hela eller delar av CampusLyans verksamhet säljs, överlåts,
                slås samman, finansieras eller integreras med annan verksamhet
                kan personuppgifter lämnas ut till våra rådgivare, potentiella
                köpare, investerare och deras rådgivare, i den utsträckning det
                är nödvändigt för transaktionen.
              </Paragraph>

              <Subheading>Annonsörer och annonsnätverk</Subheading>
              <Paragraph>
                Vi kan dela vissa uppgifter med annonsörer, annonsnätverk och
                analysleverantörer för att mäta, analysera och anpassa vår
                marknadsföring, i den mån detta är tillåtet enligt tillämplig lag
                och, när det krävs, baserat på ditt samtycke.
              </Paragraph>
              <Paragraph>
                Vi säljer inte marknadsföringslistor till tredje part för deras
                egna marknadsföringsändamål.
              </Paragraph>
              <Paragraph>
                Vi kommer inte att dela, sälja, överföra eller på annat sätt
                lämna ut personuppgifter utöver vad som anges i denna
                personuppgiftspolicy, om vi inte är skyldiga att göra det på
                grund av en rättslig förpliktelse eller om vi först har inhämtat
                ditt samtycke.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Användningen av kakor, pixlar och liknande spårningsteknik inom CampusLyan">
              <Paragraph>
                När du besöker vår webbplats eller använder våra tjänster, appar,
                meddelandesystem, e-postmeddelanden eller verktyg kan CampusLyan
                eller våra partners använda kakor, pixlar eller liknande
                spårningsteknik för att lagra eller hämta information för olika
                ändamål såsom funktionalitet, analys, statistik,
                produktutveckling, rapportering, resultatmätning, annonsering,
                personalisering och marknadsföring.
              </Paragraph>
              <Paragraph>
                Användningen av kakor och liknande spårningsteknik regleras
                bland annat av lagen om elektronisk kommunikation och gällande
                dataskyddsregler.
              </Paragraph>

              <Subheading>Vad är kakor, pixlar och liknande spårningsteknik?</Subheading>
              <Paragraph>
                Som de flesta webbplatser använder vi teknik som består av små
                textfiler eller tekniska identifierare som placeras på din dator,
                surfplatta eller mobiltelefon, eller lagras i din webbläsare, när
                du besöker eller interagerar med våra webbplatser, tjänster,
                appar, meddelandesystem eller verktyg.
              </Paragraph>
              <Paragraph>
                De specifika namnen och typerna av kakor, pixlar och annan
                liknande teknik som vi använder kan komma att ändras från tid
                till annan.
              </Paragraph>
              <Paragraph>
                För att du på ett lättare sätt ska förstå vår policy gällande
                kakor och liknande tekniker har vi skapat en enkel översikt av
                använda termer och definitioner.
              </Paragraph>
              <Subheading>Kakor</Subheading>
              <Paragraph>
                Kakor är små textfiler, vanligtvis bestående av bokstäver och
                siffror, som placeras i minnet hos din webbläsare eller i din
                enhet när du besöker en webbplats eller läser ett meddelande.
                Kakor gör det möjligt för en webbplats att känna igen en viss
                enhet eller webbläsare.
              </Paragraph>
              <Paragraph>Det finns flera olika typer av kakor:</Paragraph>
              <BulletList
                items={[
                  "Tillfälliga kakor, även kallade sessionskakor, avslutas när du stänger webbläsaren och gör det möjligt för oss att komma ihåg din aktivitet medan du använder webbplatsen.",
                  "Bestående kakor lagras på din enhet under en viss tid och gör det möjligt för oss att komma ihåg dina preferenser eller din aktivitet över flera besök.",
                  "Förstapartskakor sätts av den webbplats du besöker, exempelvis CampusLyans webbplats.",
                  "Tredjepartskakor sätts av en tredje part och kan användas exempelvis för analys, annonsering eller integrerade tjänster.",
                ]}
              />
              <Paragraph>
                Kakor kan normalt stängas av eller raderas genom verktyg som
                finns i de flesta webbläsare. Olika webbläsare erbjuder olika val
                för att hantera eller blockera kakor.
              </Paragraph>

              <Subheading>Pixlar</Subheading>
              <Paragraph>
                Pixlar är små grafiska bilder eller kodsnuttar som kan
                inkluderas på våra webbplatser, i våra tjänster, appar,
                meddelandesystem eller e-postmeddelanden. Pixlar kan användas
                för att mäta exempelvis om ett e-postmeddelande har öppnats, om
                en annons har visats eller hur användare interagerar med vår
                webbplats.
              </Paragraph>

              <Subheading>Liknande teknik för att lagra information</Subheading>
              <Paragraph>
                Liknande teknik är teknik som lagrar information i din webbläsare
                eller enhet och som kan använda lokal lagring, sessionslagring
                eller andra tekniska lösningar. Vi kan använda sådana tekniker
                för att exempelvis hålla dig inloggad, spara inställningar,
                skydda ditt konto, upptäcka ovanligt beteende och utvärdera
                prestandan i våra tjänster.
              </Paragraph>
              <Paragraph>
                Vi kan omväxlingsvis använda termerna "kakor" eller "liknande
                teknik" för att beskriva sådan teknik som används för att lagra
                data i din webbläsare eller enhet eller för att samla in
                information som hjälper oss att identifiera dig eller förstå hur
                våra tjänster används.
              </Paragraph>

              <Subheading>Dina val och vår användning av kakor och liknande teknik</Subheading>
              <Paragraph>
                På våra webbplatser erbjuder vi funktioner, tjänster och verktyg
                som i vissa fall är beroende av kakor och liknande teknik. Vi
                inhämtar ditt samtycke till kakor första gången du besöker våra
                webbplatser, i den mån samtycke krävs. När du har lämnat ditt
                samtycke kan du ändra dina inställningar när som helst.
              </Paragraph>
              <Paragraph>
                Kakor och liknande teknik kan ofta blockeras i webbläsarens
                inställningar eller i din mobila plattform. Om du blockerar viss
                teknik kan det påverka funktionaliteten på våra webbplatser eller
                innebära att vissa funktioner inte går att använda, exempelvis
                inloggning, sparade sökningar eller personliga inställningar.
              </Paragraph>
              <Paragraph>
                I vår cookiepanel eller{" "}
                <Link
                  className="font-medium text-foreground underline underline-offset-4"
                  href="/cookie-policy"
                >
                  cookiepolicy
                </Link>{" "}
                kan du hitta mer detaljerad information om vilka kakor och
                liknande tekniker som används, vilka tredje parter som kan
                förekomma, hur länge uppgifterna sparas och hur du kan ändra
                eller återkalla ditt samtycke.
              </Paragraph>

              <Subheading>Användningen av tekniken faller inom följande kategorier</Subheading>
              <BulletList
                items={[
                  "Nödvändiga: Vi kan använda kakor eller annan liknande teknik som är nödvändig för att våra webbplatser, tjänster och verktyg ska fungera. Detta inkluderar teknik som ger dig åtkomst till tjänsten, håller dig inloggad, sparar säkerhetsinställningar, motverkar missbruk och förbättrar säkerheten.",
                  "Analys och produktutveckling: Vi kan använda kakor och annan liknande teknik för att utvärdera prestandan hos våra webbplatser, tjänster och verktyg. Detta inkluderar analysarbete för att förstå hur besökare använder våra webbplatser, vilka funktioner som används och hur vi kan förbättra innehåll, funktionalitet och användarupplevelse.",
                  "Personalisering: Vi kan använda kakor och annan liknande teknik för att erbjuda förbättrad funktionalitet när du använder CampusLyan. Det kan exempelvis handla om att känna igen dig när du loggar in, komma ihåg dina preferenser, visa sparade sökningar eller anpassa innehåll och bostadsrekommendationer efter dina val och intressen.",
                  "Marknadsföring: Vi kan använda kakor och annan liknande teknik för att anpassa marknadsföring i olika kanaler såsom e-post, sociala medier, sökmotorer och digitala annonseringsplattformar baserat på dina intressen och din användning av våra tjänster.",
                  "Annonsering: Vi kan använda förstapartskakor eller tredjepartskakor samt pixlar för att leverera innehåll på våra eller tredje parters webbplatser, inklusive annonser som är relevanta baserat på dina intressen. Detta kan även användas för att mäta effektiviteten av annonser och innehåll som visas för dig.",
                ]}
              />
              <Paragraph>
                Användningen av tredjepartstekniker är inte alltid fullt ut
                kontrollerad av oss, även om teknikerna används via våra tjänster
                för att samla in och lagra data. De tredje parter som agerar som
                personuppgiftsansvariga publicerar sina egna policyer som gäller
                för deras behandling av personuppgifter.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Kontakt vid frågor">
              <Subheading>Kontakta oss</Subheading>
              <Paragraph>
                Vi arbetar kontinuerligt för att säkerställa att behandlingen av
                dina uppgifter sker på ett lagligt, säkert och transparent sätt.
                Du kan alltid kontakta oss om du har frågor om denna
                personuppgiftspolicy eller om hur vi behandlar dina
                personuppgifter.
              </Paragraph>
              <ContactCard />
            </PolicySection>

            <PolicySection title="Uppdateringar av denna policy">
              <Paragraph>
                Om vi gör ändringar i denna integritetspolicy kommer vi att
                publicera en uppdaterad version på CampusLyans webbplats. Vid
                större förändringar, eller om ändringen påverkar dig på ett
                väsentligt sätt, kan vi även informera dig separat, exempelvis
                via e-post, i plattformen eller genom annan tydlig information.
              </Paragraph>
            </PolicySection>
          </div>
        </div>
      </section>
    </main>
  );
}

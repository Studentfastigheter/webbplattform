import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cookiepolicy",
  description: "Cookiepolicy för CampusLyan.",
  alternates: {
    canonical: "/cookiepolicy",
  },
};

const lastUpdated = "17 maj 2026";
const contactEmail = "privacy@campuslyan.se";

type CookieTableRow = {
  id: string;
  nameAndDomain: string;
  type: string;
  category: string;
  purpose: string;
  retention: string;
};

const cookieRows: CookieTableRow[] = [
  {
    id: "consent",
    nameAndDomain: "[COOKIE-NAMN] | campuslyan.se",
    type: "Förstapart",
    category: "Nödvändig",
    purpose: "Exempelvis: sparar dina val för cookiesamtycke.",
    retention: "Exempelvis: 12 månader",
  },
  {
    id: "session",
    nameAndDomain: "[COOKIE-NAMN] | campuslyan.se",
    type: "Förstapart",
    category: "Nödvändig",
    purpose: "Exempelvis: håller reda på din session när du använder Tjänsten.",
    retention: "Exempelvis: session",
  },
  {
    id: "preferences",
    nameAndDomain: "[COOKIE-NAMN] | campuslyan.se",
    type: "Förstapart",
    category: "Funktionell",
    purpose: "Exempelvis: sparar språkval eller användarinställningar.",
    retention: "Exempelvis: 30 dagar",
  },
  {
    id: "analytics",
    nameAndDomain: "[COOKIE-NAMN] | [TREDJEPARTSDOMÄN]",
    type: "Tredjepart",
    category: "Analys",
    purpose: "Exempelvis: analyserar användning av Hemsidan.",
    retention: "Exempelvis: 13 månader",
  },
  {
    id: "marketing",
    nameAndDomain: "[COOKIE-NAMN] | [TREDJEPARTSDOMÄN]",
    type: "Tredjepart",
    category: "Marknadsföring",
    purpose: "Exempelvis: mäter kampanjprestanda eller annonsklick.",
    retention: "Exempelvis: 90 dagar",
  },
];

function Paragraph({ children }: { children: ReactNode }) {
  return <p className="text-base leading-8 text-muted-foreground">{children}</p>;
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border pb-8 last:border-b-0">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="font-medium text-foreground underline underline-offset-4" href={href}>
      {children}
    </a>
  );
}

function CookieTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-muted/60 text-foreground">
          <tr>
            <th className="border-b border-border px-4 py-3 font-semibold">Namn och domän</th>
            <th className="border-b border-border px-4 py-3 font-semibold">Typ</th>
            <th className="border-b border-border px-4 py-3 font-semibold">Kategori</th>
            <th className="border-b border-border px-4 py-3 font-semibold">Ändamål</th>
            <th className="border-b border-border px-4 py-3 font-semibold">Lagringstid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-muted-foreground">
          {cookieRows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-4 align-top font-medium text-foreground">{row.nameAndDomain}</td>
              <td className="px-4 py-4 align-top">{row.type}</td>
              <td className="px-4 py-4 align-top">{row.category}</td>
              <td className="px-4 py-4 align-top">{row.purpose}</td>
              <td className="px-4 py-4 align-top">{row.retention}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="pb-20 pt-10">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Tillbaka till startsidan
            </Link>
          </div>

          <header className="mb-12 border-b border-border pb-8">
            <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              CampusLyan
            </p>
            <h1 className="text-4xl font-bold text-foreground md:text-6xl">
              Cookiepolicy
            </h1>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Senast uppdaterad: {lastUpdated}
            </p>
          </header>

          <div className="space-y-8">
            <PolicySection title="Allmän information">
              <Paragraph>
                Denna cookiepolicy beskriver hur CampusLyan Nordics AB, org.nr.
                559587-0048, med adress Landsvägsgatan 19, 413 04 Göteborg,
                Sverige, ("vi", "oss", "vår" eller "CampusLyan") använder
                cookies och liknande tekniker på{" "}
                <InlineLink href="https://www.campuslyan.se">
                  www.campuslyan.se
                </InlineLink>{" "}
                och i våra tillhörande digitala tjänster ("Plattformen").
              </Paragraph>
              <Paragraph>
                CampusLyan tillhandahåller en digital plattform där studenter
                och andra bostadssökande kan hitta, bevaka och få överblick
                över studentbostäder, bostadsköer och bostadsrelaterad
                information. När Besökare använder CampusLyans digitala
                plattform använder vi cookies och liknande tekniker för att
                säkerställa att Plattformen fungerar korrekt, samt för att ge
                Besökaren en bättre, säkrare och mer anpassad användarupplevelse.
              </Paragraph>
              <Paragraph>
                Besökaren kan när som helst ändra eller återkalla sitt samtycke
                via cookie-inställningarna.
              </Paragraph>
              <Paragraph>
                Denna cookiepolicy ska läsas tillsammans med vår{" "}
                <Link
                  className="font-medium text-foreground underline underline-offset-4"
                  href="/integritetspolicy"
                >
                  integritetspolicy
                </Link>{" "}
                för ytterligare information om hur vi behandlar personuppgifter
                och vilka rättigheter du har enligt GDPR.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Cookies">
              <Paragraph>
                En cookie är en liten textfil med information som lagras på
                Besökarens webbläsare, mobiltelefon, surfplatta eller annan
                enhet när denne besöker en webbplats.
              </Paragraph>
              <Paragraph>
                Cookiefilen kan registrera hur Besökaren interagerar med
                Hemsidan, vilka inställningar som Besökaren föredrar samt
                teknisk information om Besökarens enhet. Vi använder cookies på
                Plattformen för att möjliggöra och förbättra de tjänster som
                erbjuds efter Besökarens interaktion.
              </Paragraph>
              <Paragraph>
                Det finns även andra tekniker som kan ha liknande funktion som
                cookies, exempelvis pixeltaggar, web beacons, lokal lagring,
                sessionslagring och liknande tekniker. I denna cookiepolicy
                använder vi begreppet "cookies" som ett samlingsbegrepp för
                cookies och sådana liknande tekniker.
              </Paragraph>
              <Paragraph>
                Om Besökaren inte vill acceptera cookies kan Besökaren
                inaktivera och blockera dem genom att ändra inställningarna i
                webbläsaren, till exempel Chrome, Safari, Edge eller Firefox.
                Observera att vissa funktioner på hemsidan då kan begränsas,
                exempelvis att automatisk inloggning och andra tjänster som
                kräver cookies kan sluta fungera.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Behandling av uppgifter och ändamål">
              <Paragraph>
                Vi behandlar de uppgifter som samlas in genom cookies för att
                förbättra Besökarens upplevelse av vår Plattform, känna igen
                återkommande Besökare, analysera Plattformens användning och
                optimera dess struktur och kommunikation. Behandlingen gör det
                också möjligt för oss att anpassa tjänster och innehåll till
                Besökaren och förbättra prestanda.
              </Paragraph>
              <Paragraph>
                Behandling som syftar till att skapa intresseprofiler eller visa
                riktade eller mer relevanta annonser sker endast efter att
                Besökaren har lämnat sitt uttryckliga samtycke via cookiepanelen.
              </Paragraph>
              <Paragraph>
                CampusLyans rättsliga grund för att använda nödvändiga cookies i
                syfte att tillhandahålla en säker och fungerande Plattform och
                tjänster, som Besökaren begärt genom sina åtgärder på
                Plattformen, är vårt berättigade intresse enligt artikel 6.1 (f)
                GDPR.
              </Paragraph>
              <Paragraph>
                Cookies och liknande tekniker får endast lagras på Besökarens
                enhet om Besökaren lämnat ett giltigt samtycke, med undantag för
                sådana cookies som är strikt nödvändiga för att vår Hemsida ska
                fungera, så kallade nödvändiga cookies.
              </Paragraph>
              <Paragraph>
                Du kan när som helst ändra dina cookieinställningar eller
                återkalla ditt samtycke genom vår cookiepanel, om sådan funktion
                finns tillgänglig, eller genom inställningarna i din webbläsare.
              </Paragraph>
              <Paragraph>
                I de fall informationen som samlas in med hjälp av cookies kan
                hänföras till en identifierbar person kan den utgöra
                personuppgifter och omfattas därav av dataskyddsförordningen
                (GDPR).
              </Paragraph>
              <Paragraph>
                Vi använder eller kan komma att använda följande typer av
                cookies för de syften som anges nedan.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Nödvändiga cookies">
              <Paragraph>
                Nödvändiga cookies är sådana cookies som behövs för att
                Plattformen ska fungera på ett korrekt och säkert sätt. De gör
                det möjligt för Besökare att navigera på Plattformen, använda
                dess kärnfunktioner och få tillgång till säkra områden.
              </Paragraph>
              <Paragraph>
                Eftersom nödvändiga cookies är väsentliga för Plattformens
                funktionalitet är de alltid aktiverade som standard och kan inte
                stängas av via våra inställningar. Besökare kan fortfarande
                välja att blockera eller få varningar om dessa cookies via
                inställningarna i webbläsaren, men det kan innebära att vissa
                delar av Plattformen inte fungerar som de ska.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Funktionella cookies">
              <Paragraph>
                Vi använder funktionella cookies för att möjliggöra funktioner
                på Plattformen som är synliga för Besökaren. Dessa cookies syftar
                till att skapa och anpassa en personlig upplevelse på vår
                Plattform baserat på Besökarens tidigare val.
              </Paragraph>
              <Paragraph>
                Dessa cookies gör det möjligt för Plattformen att komma ihåg
                Besökarens inställningar, språkval, sparade preferenser,
                inloggat läge eller andra val du har gjort i Plattformen.
              </Paragraph>
              <Paragraph>
                Om du väljer att inte tillåta funktionella cookies kan vissa
                eller alla av dessa funktioner fungera begränsat eller inte alls.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Analyscookies">
              <Paragraph>
                Vi använder analyscookies för att förstå hur Besökare använder
                Plattformen. Sådana cookies kan exempelvis hjälpa oss att se
                vilka sidor som besöks, hur Besökare navigerar, vilka funktioner
                som används, om fel uppstår och hur Plattformen kan förbättras.
              </Paragraph>
              <Paragraph>
                Informationen används för att mäta, upprätthålla, driva och
                förbättra Plattformen. I den mån det är möjligt används
                aggregerad eller anonymiserad information.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Marknadsföringscookies">
              <Paragraph>
                Cookies för marknadsföring innehåller taggar och pixlar som
                används för att samla information om Besökarens digitala
                interaktioner med våra tjänster, på Plattformen och på andra
                webbplatser. Informationen från dessa cookies hjälper oss att
                mäta och förbättra effektiviteten i våra reklamkampanjer.
              </Paragraph>
              <Paragraph>
                Dessa cookies används även för att spåra besökare mellan olika
                webbplatser i syfte att visa mer relevanta och engagerande
                annonser, vilket skapar större värde för både Besökaren och våra
                Tredjepartsleverantörer.
              </Paragraph>
              <Paragraph>
                Marknadsföringscookies kan sättas av CampusLyan eller av
                tredjepartsleverantörer, exempelvis annonsplattformar, sociala
                medier eller analysleverantörer.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Tredjepartscookies">
              <Paragraph>
                Vi kan tillåta våra leverantörer och samarbetspartners att
                använda cookies på Plattformen för de syften som anges i denna
                cookiepolicy. Det kan exempelvis omfatta leverantörer av
                analysverktyg, säkerhetslösningar, annonsering, sociala medier,
                support, felsökning, drift eller andra tekniska tjänster.
              </Paragraph>
              <Paragraph>
                CampusLyan kan använda digitala reklampartners för
                marknadsföringsändamål, exempelvis tredjepartsleverantörer såsom
                Meta, inklusive Facebook och Instagram, Google och andra
                annonsnätverk. Sådana samarbeten kan användas för att leverera,
                mäta och optimera annonser samt för att visa mer relevant
                marknadsföring.
              </Paragraph>
              <Paragraph>
                Dessa tredjepartsleverantörer behandlar personuppgifter i
                enlighet med sina egna personuppgiftspolicyer och ansvarar själva
                för sådan behandling.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Cookies som används på Plattformen">
              <Paragraph>
                Nedan listas de cookies som vi använder på Plattformen.
              </Paragraph>
              <CookieTable />
              <Paragraph>
                Om en cookie används för flera ändamål eller om lagringstiden
                ändras kommer detta att anges i tabellen ovan. Mer detaljerad
                information kan även finnas i den cookiepanel som visas på
                Plattformen.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Hantera dina cookies">
              <Paragraph>
                Du kan själv hantera hur cookies används på flera sätt.
              </Paragraph>
              <Paragraph>
                Du kan ändra eller återkalla ditt samtycke via cookiepanelen på
                Plattformen, om sådan funktion finns tillgänglig, eller hantera
                cookies genom inställningarna i din webbläsare.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Ändringar av denna cookiepolicy">
              <Paragraph>
                Vi kan ändra och uppdatera denna cookiepolicy vid behov.
                Exempelvis om vi inför nya funktioner, byter leverantörer eller
                behöver anpassa policyn till nya rättsliga krav. Ändringar och
                uppdateringar publiceras på denna sida och träder i kraft inom
                1-2 veckor från publiceringsdatumet.
              </Paragraph>
              <Paragraph>
                Den senaste versionen av cookiepolicyn kommer alltid att finnas
                tillgänglig på Plattformen. Vid större förändringar kan vi även
                informera dig på annat lämpligt sätt, exempelvis genom
                cookiepanelen, via e-post eller i Plattformen.
              </Paragraph>
            </PolicySection>

            <PolicySection title="Kontakt">
              <Paragraph>
                Om du har frågor avseende vårt användande av cookies vänligen
                kontakta{" "}
                <InlineLink href={`mailto:${contactEmail}`}>{contactEmail}</InlineLink>.
              </Paragraph>
            </PolicySection>
          </div>
        </div>
      </section>
    </main>
  );
}

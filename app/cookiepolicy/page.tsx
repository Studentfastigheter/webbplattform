import type { Metadata } from "next";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cookiepolicy",
  description: "Cookiepolicy för CampusLyan.",
  alternates: {
    canonical: "/cookiepolicy",
  },
};

const contactEmail = "privacy@campuslyan.se";

/* --- Hjäpkomponenter för typografi och layout --- */

function Paragraph({ children }: { children: ReactNode }) {
  return <p className="text-base leading-7 text-muted-foreground">{children}</p>;
}

function PolicySection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="space-y-6 pt-10 pb-14 border-b border-border/50 last:border-b-0 scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 mt-10">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {children}
    </div>
  );
}

/* --- Hjälpkomponenter för Tabeller --- */

function PolicyTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="policy-table w-full text-left text-sm md:min-w-[900px]">
          <thead className="border-b border-border bg-muted/40 text-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className="px-5 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Children.map(children, (child) =>
              isValidElement<TableRowProps>(child) ? cloneElement(child, { columns }) : child
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type TableRowProps = {
  children: ReactNode;
  columns?: string[];
};

type TableCellProps = {
  children: ReactNode;
  className?: string;
  label?: string;
};

function Tr({ children, columns = [] }: TableRowProps) {
  return (
    <tr className="align-top transition-colors hover:bg-muted/10">
      {Children.map(children, (child, index) =>
        isValidElement<TableCellProps>(child)
          ? cloneElement(child, { label: columns[index] })
          : child
      )}
    </tr>
  );
}

function Td({ children, className = "", label }: TableCellProps) {
  return (
    <td data-label={label} className={`px-5 py-4 leading-relaxed text-muted-foreground ${className}`}>
      {children}
    </td>
  );
}

/* --- Huvudsida --- */

export default function CookiepolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* Sidhuvud */}
      <section className="border-b border-border bg-muted/10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Cookiepolicy
          </h1>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Senast uppdaterad den 21/5-2026
          </p>
        </div>
      </section>

      {/* Huvudinnehåll */}
      <section className="px-4 py-10 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <article className="w-full min-w-0">
            
            <PolicySection id="allman-information" title="Allmän information">
              <Paragraph>
                Denna cookiepolicy beskriver hur CampusLyan Nordics AB, (org.nr. 559587-0048), med adress Landsvägsgatan 19, 413 04 Göteborg, Sverige, ("vi", "oss", "vår" eller "CampusLyan") använder cookies och liknande tekniker på www.campuslyan.se och i våra tillhörande digitala tjänster ("Hemsidan" eller "Tjänsten").
              </Paragraph>
              <Paragraph>
                CampusLyan tillhandahåller en digital plattform där studenter och andra bostadssökande kan hitta, bevaka och få överblick över studentbostäder, bostadsköer och bostadsrelaterad information. För att Hemsidan och Tjänsten ska fungera korrekt, förbättras över tid och kunna anpassas efter användarnas behov använder vi cookies och liknande tekniker.
              </Paragraph>
              <Paragraph>
                Denna cookiepolicy ska läsas tillsammans med vår integritetspolicy, där vi beskriver hur vi behandlar personuppgifter och vilka rättigheter du har enligt dataskyddslagstiftningen.
              </Paragraph>
            </PolicySection>

            <PolicySection id="cookies" title="Cookies">
              <Paragraph>
                En cookie är en liten textfil som skickas från en webbplats och lagras i din webbläsare, mobiltelefon, surfplatta eller annan enhet när du besöker webbplatsen.
              </Paragraph>
              <Paragraph>
                Cookies kan hjälpa oss att känna igen din enhet nästa gång du besöker Hemsidan, ge dig tillgång till vissa funktioner, komma ihåg dina inställningar, förbättra säkerheten, analysera hur Hemsidan används och mäta effekten av vår marknadsföring.
              </Paragraph>
              <Paragraph>
                Det finns även andra tekniker som kan ha liknande funktion som cookies, exempelvis pixeltaggar, web beacons, lokal lagring, sessionslagring och liknande tekniker. I denna cookiepolicy använder vi begreppet "cookies" som ett samlingsbegrepp för cookies och sådana liknande tekniker.
              </Paragraph>
            </PolicySection>

            <PolicySection id="anvandning" title="Användning av cookies">
              <Paragraph>
                Huvudsyftet med vår användning av cookies är att Hemsidan och Tjänsten ska fungera på ett säkert, effektivt och användarvänligt sätt. Vi använder även cookies för att förstå hur Tjänsten används, förbättra funktioner, mäta kampanjer och, när du har lämnat samtycke, anpassa innehåll och marknadsföring.
              </Paragraph>
              <Paragraph>
                Vi använder eller kan komma att använda följande typer av cookies för de syften som anges nedan.
              </Paragraph>

              <SubSection title="Nödvändiga cookies">
                <Paragraph>
                  Vi använder cookies som är nödvändiga för driften av Hemsidan och Tjänsten. Dessa cookies behövs för att webbplatsen ska fungera korrekt och för att du ska kunna använda grundläggande funktioner, exempelvis navigering, säkerhet, inloggning, sessionshantering, cookieinställningar och skydd mot missbruk.
                </Paragraph>
                <Paragraph>
                  Nödvändiga cookies kan normalt inte stängas av genom vår cookiepanel, eftersom de krävs för att Hemsidan och Tjänsten ska fungera. Du kan däremot blockera cookies i din webbläsare, men det kan innebära att vissa delar av Hemsidan eller Tjänsten inte fungerar som de ska.
                </Paragraph>
              </SubSection>

              <SubSection title="Funktionella cookies">
                <Paragraph>
                  Vi använder funktionella cookies för att komma ihåg dina val och förbättra användarupplevelsen. Det kan exempelvis handla om att komma ihåg språkval, inställningar, sparade preferenser, inloggat läge eller andra val du har gjort i Tjänsten.
                </Paragraph>
                <Paragraph>
                  Dessa cookies gör det möjligt för oss att tillhandahålla Tjänsten på ett mer anpassat och smidigt sätt när du fortsätter använda eller återvänder till Hemsidan.
                </Paragraph>
              </SubSection>

              <SubSection title="Analyscookies">
                <Paragraph>
                  Vi använder analyscookies för att förstå hur besökare använder Hemsidan och Tjänsten. Sådana cookies kan exempelvis hjälpa oss att se vilka sidor som besöks, hur användare navigerar, vilka funktioner som används, om fel uppstår och hur Tjänsten kan förbättras.
                </Paragraph>
                <Paragraph>
                  Informationen används för att mäta, upprätthålla, driva och förbättra Hemsidan och Tjänsten. I den mån det är möjligt används aggregerad eller anonymiserad information.
                </Paragraph>
              </SubSection>

              <SubSection title="Marknadsföringscookies">
                <Paragraph>
                  Vi använder marknadsföringscookies för att mäta och förbättra vår marknadsföring samt, när du har lämnat samtycke, visa mer relevant innehåll och annonsering. Sådana cookies kan användas för att mäta kampanjprestanda, förstå hur användare hittar till CampusLyan och följa upp interaktioner med annonser eller kampanjer.
                </Paragraph>
                <Paragraph>
                  Marknadsföringscookies kan sättas av CampusLyan eller av tredjepartsleverantörer, exempelvis annonsplattformar, sociala medier eller analysleverantörer.
                </Paragraph>
              </SubSection>

              <SubSection title="Tredjepartscookies">
                <Paragraph>
                  Vi kan tillåta våra leverantörer och samarbetspartners att använda cookies på Hemsidan för de syften som anges i denna cookiepolicy. Det kan exempelvis omfatta leverantörer av analysverktyg, säkerhetslösningar, annonsering, sociala medier, support, felsökning, drift eller andra tekniska tjänster.
                </Paragraph>
                <Paragraph>
                  När tredjepartscookies används kan den tredje parten i vissa fall vara självständigt personuppgiftsansvarig för sin behandling. I sådana fall gäller även den tredje partens egna villkor och integritetspolicy.
                </Paragraph>
              </SubSection>
            </PolicySection>

            <PolicySection id="lista" title="Cookies som används på Hemsidan">
              <Paragraph>
                Nedan listas de cookies som vi använder på Hemsidan.
              </Paragraph>
              
              <PolicyTable columns={["Namn och domän", "Typ", "Kategori", "Ändamål", "Lagringstid"]}>
                <Tr>
                  <Td className="font-medium text-foreground">[COOKIE-NAMN] | campuslyan.se</Td>
                  <Td>Förstapart</Td>
                  <Td>Nödvändig</Td>
                  <Td>[Exempelvis: sparar dina val för cookie-samtycke]</Td>
                  <Td>[Exempelvis: 12 månader]</Td>
                </Tr>
                <Tr>
                  <Td className="font-medium text-foreground">[COOKIE-NAMN] | campuslyan.se</Td>
                  <Td>Förstapart</Td>
                  <Td>Nödvändig</Td>
                  <Td>[Exempelvis: håller reda på din session när du använder Tjänsten]</Td>
                  <Td>[Exempelvis: session]</Td>
                </Tr>
                <Tr>
                  <Td className="font-medium text-foreground">[COOKIE-NAMN] | campuslyan.se</Td>
                  <Td>Förstapart</Td>
                  <Td>Funktionell</Td>
                  <Td>[Exempelvis: sparar språkval eller användarinställningar]</Td>
                  <Td>[Exempelvis: 30 dagar]</Td>
                </Tr>
                <Tr>
                  <Td className="font-medium text-foreground">[COOKIE-NAMN] | [TREDJEPARTSDOMÄN 1]</Td>
                  <Td>Tredjepart</Td>
                  <Td>Analys</Td>
                  <Td>[Exempelvis: analyserar användning av Hemsidan]</Td>
                  <Td>[Exempelvis: 13 månader]</Td>
                </Tr>
                <Tr>
                  <Td className="font-medium text-foreground">[COOKIE-NAMN] | [TREDJEPARTSDOMÄN 2]</Td>
                  <Td>Tredjepart</Td>
                  <Td>Marknadsföring</Td>
                  <Td>[Exempelvis: mäter kampanjprestanda eller annonsklick]</Td>
                  <Td>[Exempelvis: 90 dagar]</Td>
                </Tr>
              </PolicyTable>
              
              <Paragraph>
                Om en cookie används för flera ändamål eller om lagringstiden ändras kommer detta att anges i tabellen ovan. Mer detaljerad information kan även finnas i den cookiepanel som visas på Hemsidan.
              </Paragraph>
            </PolicySection>

            <PolicySection id="syfte-rattlig-grund" title="Syftet med cookies och rättslig grund">
              <Paragraph>
                Med undantag för nödvändiga cookies använder vi cookies endast när det finns en giltig rättslig grund och, när samtycke krävs, först efter att du har lämnat ditt samtycke.
              </Paragraph>
              <Paragraph>
                Nödvändiga cookies används för att Hemsidan och Tjänsten ska fungera och kräver normalt inte ditt samtycke. För funktionella cookies, analyscookies, marknadsföringscookies och tredjepartscookies inhämtar vi ditt samtycke i den mån det krävs enligt tillämplig lag.
              </Paragraph>
              <Paragraph>
                Du kan när som helst ändra dina cookieinställningar eller återkalla ditt samtycke genom vår cookiepanel, om sådan funktion finns tillgänglig, eller genom inställningarna i din webbläsare. Om cookies eller liknande tekniker innebär behandling av personuppgifter sker sådan behandling i enlighet med vår integritetspolicy.
              </Paragraph>
            </PolicySection>

            <PolicySection id="hantera" title="Hantera dina cookies">
              <Paragraph>
                Du kan själv hantera hur cookies används på flera sätt. Du kan ändra eller återkalla ditt samtycke via den cookiepanel som finns på Hemsidan, om sådan funktion finns tillgänglig. Du kan även använda inställningarna i din webbläsare för att blockera, begränsa eller radera cookies.
              </Paragraph>
              <Paragraph>
                De flesta webbläsare gör det möjligt att:
              </Paragraph>
              <ul className="list-disc list-outside ml-5 space-y-2 text-base leading-7 text-muted-foreground mb-4">
                <li>se vilka cookies som finns lagrade på din enhet,</li>
                <li>radera cookies,</li>
                <li>blockera cookies från vissa webbplatser,</li>
                <li>blockera tredjepartscookies, och blockera alla cookies.</li>
              </ul>
              <Paragraph>
                Om du väljer att blockera eller radera cookies kan funktionaliteten på Hemsidan och i Tjänsten påverkas. Exempelvis kan du behöva logga in på nytt, vissa inställningar kan försvinna och vissa funktioner kan sluta fungera korrekt.
              </Paragraph>
            </PolicySection>

            <PolicySection id="andringar" title="Ändringar av denna cookiepolicy">
              <Paragraph>
                Vi kan komma att uppdatera denna cookiepolicy från tid till annan, exempelvis om vi ändrar vilka cookies vi använder, inför nya funktioner, byter leverantörer eller behöver anpassa policyn till nya rättsliga krav.
              </Paragraph>
              <Paragraph>
                Den senaste versionen av cookiepolicyn kommer alltid att finnas tillgänglig på Hemsidan. Vid större förändringar kan vi även informera dig på annat lämpligt sätt, exempelvis genom cookiepanelen, via e-post eller i Tjänsten.
              </Paragraph>
            </PolicySection>

            <PolicySection id="kontakt" title="Kontakt">
              <Paragraph>
                Om du har frågor avseende vårt användande av cookies vänligen kontakta{" "}
                <a className="font-medium text-foreground underline-offset-4 hover:underline" href={`mailto:${contactEmail}`}>
                  {contactEmail}
                </a>.
              </Paragraph>
            </PolicySection>

          </article>
        </div>
      </section>
    </main>
  );
}

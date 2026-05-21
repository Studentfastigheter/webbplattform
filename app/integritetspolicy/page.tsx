import type { Metadata } from "next";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description: "Integritetspolicy för CampusLyan.",
  alternates: {
    canonical: "/integritetspolicy",
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

function SidebarLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="block py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {children}
      </a>
    </li>
  );
}

function ContactCard() {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-6 text-sm leading-relaxed text-muted-foreground shadow-sm max-w-sm mt-4">
      <p className="font-semibold text-foreground mb-1">CampusLyan Nordics AB</p>
      <p>Org.nr. 559587-0048</p>
      <p>Landsvägsgatan 19, 413 04, Göteborg, Sverige</p>
      <a className="mt-3 inline-block font-medium text-foreground underline-offset-4 hover:underline" href={`mailto:${contactEmail}`}>
        {contactEmail}
      </a>
    </div>
  );
}

/* --- Hjälpkomponenter för Tabeller --- */

function PolicyTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="policy-table w-full text-left text-sm md:min-w-[720px]">
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

function TdTitle({ children, label }: TableCellProps) {
  return (
    <td data-label={label} className="w-1/3 px-5 py-4 font-medium leading-relaxed text-foreground">
      {children}
    </td>
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

export default function IntegritetspolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* Sidhuvud */}
      <section className="border-b border-border bg-muted/10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Integritetspolicy
          </h1>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Senast uppdaterad den 21 maj 2026
          </p>
        </div>
      </section>

      {/* Huvudinnehåll med sidomeny */}
      <section className="px-4 py-10 sm:px-6 md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:gap-16">
          
          {/* Sidomeny (Sticky Table of Contents) */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <h3 className="mb-4 text-sm font-semibold tracking-tight text-foreground uppercase">
                Innehåll
              </h3>
              <nav>
                <ul className="space-y-1">
                  <SidebarLink href="#inledning">Inledning</SidebarLink>
                  <SidebarLink href="#ansvarig">Personuppgiftsansvarig</SidebarLink>
                  <SidebarLink href="#vilken-information">Vilken information behandlar vi?</SidebarLink>
                  <SidebarLink href="#syften">För vilka syften?</SidebarLink>
                  <SidebarLink href="#lagringstid">Hur länge sparar vi uppgifterna?</SidebarLink>
                  <SidebarLink href="#plats">Var behandlas uppgifterna?</SidebarLink>
                  <SidebarLink href="#rattigheter">Dina rättigheter</SidebarLink>
                  <SidebarLink href="#mottagare">Till vem lämnas uppgifter ut?</SidebarLink>
                  <SidebarLink href="#cookies">Kakor och spårningsteknik</SidebarLink>
                  <SidebarLink href="#kontakt">Kontakt vid frågor</SidebarLink>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Texter och Tabeller */}
          <article className="w-full min-w-0">
            
            <PolicySection id="inledning" title="Personuppgiftspolicy för CampusLyans tjänster">
              <Paragraph>
                CampusLyan Nordics AB ("CampusLyan", "vi", "oss" eller "vår") ansvarar för behandlingen av
                personuppgifter inom CampusLyans webbplats, plattform och tillhörande tjänster, om
                inte annat anges i denna personuppgiftspolicy.
              </Paragraph>
              <Paragraph>
                CampusLyan tillhandahåller en studentfokuserad bostadsplattform som samlar
                studentbostäder, bostadsköer och bostadsrelaterad information på en plats. Plattformen
                hjälper studenter och andra bostadssökande att hitta, bevaka och anmäla intresse för
                bostäder samt att få en bättre överblick över relevanta bostadsköer och
                bostadsaktörer.
              </Paragraph>
              <Paragraph>
                Anslutna bostadsföretag, fastighetsägare, studentkårer och andra samarbetspartners
                kan genom CampusLyan tillgängliggöra information, synliggöra bostäder och nå ut till
                relevanta studentgrupper. CampusLyan är dock inte hyresvärd, förmedlar inte
                hyresavtal i eget namn och fattar inte beslut om vem som får en bostad.
              </Paragraph>
              <Paragraph>
                Anslutna bostadsföretag, fastighetsägare och andra samarbetspartners är normalt
                självständigt personuppgiftsansvariga för den behandling av personuppgifter som sker
                inom ramen för deras egna bostadsköer, uthyrningsprocesser, urval, erbjudanden,
                hyresavtal, kundrelationer och system. Vänligen kontakta respektive bostadsföretag,
                fastighetsägare eller samarbetspartner för information om hur den parten behandlar
                dina personuppgifter.
              </Paragraph>
              <Paragraph>
                När CampusLyan endast visar information om en bostad, en bostadskö eller en
                samarbetspartner och länkar dig vidare till en extern webbplats, ansvarar den externa
                parten för den insamling och behandling av personuppgifter som sker där. När du
                däremot använder CampusLyans egna funktioner, exempelvis konto, sparade bostäder,
                bevakningar, kööversikt, verifiering, intresseanmälningar eller kommunikation via
                plattformen, ansvarar CampusLyan för den behandling som sker inom våra egna tjänster.
              </Paragraph>
              <Paragraph>
                Vi säkerställer att dina personuppgifter är skyddade och att behandlingen sker i
                enlighet med gällande lagar, dataskyddsregler samt våra interna riktlinjer och
                processer. Vi vidtar tekniska och organisatoriska säkerhetsåtgärder för att skydda
                dina personuppgifter mot obehörig åtkomst, förlust, förändring eller otillåten
                behandling.
              </Paragraph>
              <Paragraph>
                I denna personuppgiftspolicy beskriver vi hur vi behandlar personuppgifter när du
                använder CampusLyan, skapar konto, söker eller bevakar bostäder, anmäler intresse för
                bostäder, använder funktioner för bostadsköer eller studentverifiering, kontaktar oss,
                företräder ett bostadsföretag, en fastighetsägare, en studentkår, ett fastighetssystem
                eller annan samarbetspartner, eller söker jobb hos oss. Om du är kontaktperson,
                företrädare, medsökande, referensperson eller på annat sätt berörs av våra tjänster
                gäller samma principer för dig i tillämpliga delar.
              </Paragraph>
            </PolicySection>

            <PolicySection id="ansvarig" title="Fullständig information om den ansvarige">
              <Paragraph>
                Nedan finner du våra kontaktuppgifter om du har frågor rörande vår behandling av dina
                personuppgifter.
              </Paragraph>
              <ContactCard />
            </PolicySection>

            <PolicySection id="vilken-information" title="Vilken information behandlar vi om dig?">
              <PolicyTable columns={["Datatyp", "Beskrivning", "Källa"]}>
                <Tr>
                  <TdTitle>Grundläggande profilinformation</TdTitle>
                  <Td>T.ex. namn, e-postadress, telefonnummer, adress, födelsedatum och andra kontakt- eller profiluppgifter som du anger.</Td>
                  <Td>Användaren</Td>
                </Tr>
                <Tr>
                  <TdTitle>Kontoinformation</TdTitle>
                  <Td>Kontoaktivitet, inloggningsuppgifter, kontoinställningar, sparade bostäder, bevakningar, intressemarkeringar, integritetsinställningar, supportfrågor och annan information kopplad till ditt användarkonto.</Td>
                  <Td>Användaren och CampusLyans plattform</Td>
                </Tr>
                <Tr>
                  <TdTitle>Information om studier och studentstatus</TdTitle>
                  <Td>T.ex. lärosäte, studieort, utbildning, antagningsbesked, studieintyg, studieomfattning eller annan information som används för att visa att du är student eller uppfyller krav för vissa studentbostäder.</Td>
                  <Td>Användaren, verifieringstjänster och i vissa fall samarbetspartners</Td>
                </Tr>
                <Tr>
                  <TdTitle>Verifieringsuppgifter</TdTitle>
                  <Td>Information som används för att verifiera din identitet, studentstatus eller behörighet, exempelvis uppgifter från Freja eller annan verifieringstjänst. Det kan omfatta namn, personnummer eller annan identifieringsuppgift, verifieringsstatus, tidpunkt för verifiering och teknisk information kopplad till verifieringen.</Td>
                  <Td>Användaren, verifieringstjänster och CampusLyans plattform</Td>
                </Tr>
                <Tr>
                  <TdTitle>Bostadspreferenser</TdTitle>
                  <Td>Preferenser kopplade till ditt bostadssökande, exempelvis önskad ort, lärosäte, avstånd till campus, hyresnivå, bostadstyp, storlek, inflyttningsperiod, pendlingsavstånd och andra filter eller val du gör i tjänsten.</Td>
                  <Td>Användaren och CampusLyans plattform</Td>
                </Tr>
                <Tr>
                  <TdTitle>Intresseanmälningar och bostadsansökningar</TdTitle>
                  <Td>Uppgifter om bostäder du visar intresse för, anmäler intresse till, ansöker om eller skickar förfrågningar om via CampusLyan. Det kan omfatta bostadsobjekt, ort, hyresvärd, önskad inflyttningsperiod, ansökningsstatus, meddelanden och annan information som du lämnar i samband med intresseanmälan, köansökan, bostadsansökan eller förfrågan.</Td>
                  <Td>Användaren, CampusLyans plattform och i vissa fall samarbetspartners</Td>
                </Tr>
                <Tr>
                  <TdTitle>Kö- och statusuppgifter</TdTitle>
                  <Td>Uppgifter om din befintliga eller framtida köstatus hos anslutna bostadsföretag, fastighetsägare eller samarbetspartners, exempelvis ködagar, köpoäng, köregistreringsdatum, köstatus, kömedlemskap, köhistorik och annan motsvarande information som är nödvändig för att visa eller hantera din bostadskö i CampusLyan.</Td>
                  <Td>Användaren, bostadsföretag, fastighetsägare, samarbetspartners och CampusLyans plattform</Td>
                </Tr>
                <Tr>
                  <TdTitle>Användargenererat innehåll</TdTitle>
                  <Td>Uppgifter som du själv lämnar i fritextfält, meddelanden, supportärenden, intresseanmälningar, formulär, feedback, enkäter eller annan kommunikation med oss eller via tjänsten.</Td>
                  <Td>Användaren</Td>
                </Tr>
                <Tr>
                  <TdTitle>Kommunikationsuppgifter</TdTitle>
                  <Td>Information som framgår i din korrespondens med oss, exempelvis frågor, supportärenden, feedback, klagomål, mötesanteckningar och annan kommunikation.</Td>
                  <Td>Användaren, kontaktpersoner, samarbetspartners och CampusLyan</Td>
                </Tr>
                <Tr>
                  <TdTitle>Teknisk information</TdTitle>
                  <Td>IP-adress, webbläsare, operativsystem, enhet, tekniska loggar, säkerhetsloggar, sessionsinformation och information om hur du navigerar till, på och från vår webbplats eller plattform.</Td>
                  <Td>Användaren, användarens enhet, webbläsare, CampusLyans plattform och tjänster från tredje part</Td>
                </Tr>
                <Tr>
                  <TdTitle>Beteendeinformation på plattformen</TdTitle>
                  <Td>Information om vilka typer av bostäder du tittar på, sparar, filtrerar, klickar på eller visar intresse för, vilka funktioner du använder, hur länge och när du senast använde tjänsten.</Td>
                  <Td>Användaren och CampusLyans plattform</Td>
                </Tr>
                <Tr>
                  <TdTitle>Förmodade slutsatser om användare</TdTitle>
                  <Td>Förmodade intressen, bostadspreferenser och relevanta rekommendationer baserat på profilinformation, beteendeinformation och användning av tjänsten över tid.</Td>
                  <Td>CampusLyans plattform</Td>
                </Tr>
                <Tr>
                  <TdTitle>Platsdata</TdTitle>
                  <Td>Uppgifter om användarens geografiska position (platsinformation) från GPS-data och IP-adress i användarens enheter.</Td>
                  <Td>Användaren, användarens enhet och tjänster från tredje part</Td>
                </Tr>
                <Tr>
                  <TdTitle>B2B-klientinformation</TdTitle>
                  <Td>För bostadsföretag, fastighetsägare, studentkårer, fastighetssystem, leverantörer och andra samarbetspartners samlar vi in uppgifter om företag, organisation, affärsroll, kontaktuppgifter, avtalsrelaterade uppgifter, kommunikation och kundrelation.</Td>
                  <Td>Företagskunder, samarbetspartners, kontaktpersoner och publika källor</Td>
                </Tr>
                <Tr>
                  <TdTitle>Information för regelefterlevnad</TdTitle>
                  <Td>Information som behövs för att uppfylla rättsliga skyldigheter, hantera avtalsförhållanden, säkerställa tillräcklig kund- och leverantörsinformation, bokföring, rättighetsförfrågningar och andra krav enligt lag.</Td>
                  <Td>Användaren, samarbetspartners, leverantörer, publika källor och myndigheter</Td>
                </Tr>
                <Tr>
                  <TdTitle>Rekryteringsinformation</TdTitle>
                  <Td>CV, personligt brev, betyg, utbildning, arbetslivserfarenhet, intervjuanteckningar, referenser och annan information som du lämnar i samband med en rekryteringsprocess.</Td>
                  <Td>Den arbetssökande och referenser</Td>
                </Tr>
                <Tr>
                  <TdTitle>Kakor och lokal lagringsinformation</TdTitle>
                  <Td>När du använder våra tjänster kan vi använda kakor, pixlar och liknande teknik för att känna igen dig, hålla dig inloggad, analysera användning, förbättra tjänsten, mäta resultat och anpassa marknadsföring.</Td>
                  <Td>Användarens enhet, webbläsare, CampusLyans plattform och tjänster från tredje part</Td>
                </Tr>
              </PolicyTable>

              <div className="rounded-xl bg-primary/5 p-5 border border-primary/20 mt-6">
                <p className="text-sm text-foreground">
                  <strong>Viktigt:</strong> Vi ber dig att inte lämna känsliga personuppgifter, såsom uppgifter om hälsa,
                  religion, politiska åsikter, fackligt medlemskap eller liknande, i fritextfält,
                  meddelanden eller supportärenden till oss, om vi inte uttryckligen efterfrågar sådana
                  uppgifter.
                </p>
              </div>
            </PolicySection>

            <PolicySection id="syften" title="För vilka syften behandlar vi dina uppgifter?">
              <Paragraph>
                Vi använder den information vi samlar in om dig och andra användare för att
                tillhandahålla, utveckla, förbättra och skydda CampusLyans tjänster. Här beskrivs de
                syften för vilka CampusLyan behandlar personuppgifter.
              </Paragraph>
              <Paragraph>
                För att uppnå vissa syften kan vi använda automatiserade verktyg, statistik, analys
                och AI-baserade funktioner för att exempelvis förbättra sökresultat,
                rekommendationer, matchning, support, säkerhet och produktutveckling. I den mån
                personuppgifter används för analys eller modellförbättring arbetar vi för att
                begränsa, avidentifiera eller pseudonymisera uppgifterna när det är möjligt.
              </Paragraph>
              <Paragraph>
                CampusLyan använder inte automatiserat beslutsfattande för att besluta vem som får en
                bostad. Alla beslut om köplacering, urval, erbjudanden, tilldelning av bostad och
                hyresavtal fattas av det aktuella bostadsföretaget, fastighetsägaren eller
                samarbetspartnern enligt deras egna regler, krav och processer.
              </Paragraph>
              
              <PolicyTable columns={["Behandlingsändamål", "Beskrivning", "Rättslig grund"]}>
                <Tr>
                  <TdTitle>Tillhandahålla CampusLyans plattform</TdTitle>
                  <Td>CampusLyan ger dig tillgång till en plattform där du kan söka efter studentbostäder, se bostadsköer, skapa konto, spara bostäder, skapa bevakningar, anmäla intresse och kommunicera med oss. För att kunna leverera dessa tjänster behöver vi behandla dina personuppgifter.</Td>
                  <Td>Fullgörande av avtal</Td>
                </Tr>
                <Tr>
                  <TdTitle>Skapa och administrera användarkonto</TdTitle>
                  <Td>Vi behandlar kontouppgifter för att skapa och administrera ditt konto, hantera inloggning, inställningar, sparade bostäder, intresseanmälningar, kööversikt, historik och andra kontofunktioner.</Td>
                  <Td>Fullgörande av avtal</Td>
                </Tr>
                <Tr>
                  <TdTitle>Söka, filtrera och bevaka bostäder</TdTitle>
                  <Td>Vi behandlar bostadspreferenser och användningsdata för att du ska kunna hitta relevanta bostäder, använda filter, spara sökningar, skapa bevakningar och få notifieringar om bostäder som matchar dina val.</Td>
                  <Td>Fullgörande av avtal och berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Anmäla intresse, ansöka om bostad eller skicka förfrågningar</TdTitle>
                  <Td>När du själv initierar en intresseanmälan, köansökan, bostadsansökan eller annan förfrågan behandlar vi de uppgifter som behövs för att hantera eller förmedla den till relevant bostadsföretag, fastighetsägare eller samarbetspartner.</Td>
                  <Td>Fullgörande av avtal</Td>
                </Tr>
                <Tr>
                  <TdTitle>Vidareförmedling till externa bostadsaktörer</TdTitle>
                  <Td>Om en bostad eller kö hanteras av en extern part kan vi länka dig vidare till den partens webbplats eller, när funktionen stödjer det och du initierar det, överföra nödvändig information till den parten. Den externa parten ansvarar för sin fortsatta behandling.</Td>
                  <Td>Fullgörande av avtal och berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Visa och hantera köstatus</TdTitle>
                  <Td>Om du aktivt begär, godkänner eller initierar sådan funktion kan vi hämta, ta emot, visa och administrera uppgifter om din köstatus hos anslutna bostadsföretag, fastighetsägare eller samarbetspartners.</Td>
                  <Td>Fullgörande av avtal</Td>
                </Tr>
                <Tr>
                  <TdTitle>Student- och identitetsverifiering</TdTitle>
                  <Td>För att tillhandahålla en trygg och relevant plattform kan vi behandla uppgifter för att verifiera din identitet, studentstatus eller behörighet, exempelvis genom Freja eller annan verifieringstjänst.</Td>
                  <Td>Fullgörande av avtal och berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Tillhandahålla en säker och trygg plattform</TdTitle>
                  <Td>Det är viktigt för oss att säkerställa att CampusLyan är en säker och tillförlitlig tjänst. Därför behandlar vi uppgifter för att förebygga obehörig åtkomst, falska konton, bedrägerier, tekniska angrepp, missbruk av tjänsten och handlingar som strider mot våra villkor.</Td>
                  <Td>Berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Meddelanden, notifieringar och påminnelser</TdTitle>
                  <Td>Vi kan skicka bekräftelser, notifieringar, påminnelser och annan information om ditt konto, dina bevakningar, intresseanmälningar, köuppgifter, bostadsförslag eller användning av plattformen.</Td>
                  <Td>Fullgörande av avtal och berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Förfrågningar och kundtjänst</TdTitle>
                  <Td>Om du kontaktar oss behandlar vi dina personuppgifter för att hjälpa dig med frågor, supportärenden, feedback, klagomål och andra ärenden.</Td>
                  <Td>Fullgörande av avtal och berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Förbättra tjänsten</TdTitle>
                  <Td>Vi registrerar och analyserar hur CampusLyan används för att förstå vilka funktioner som fungerar bra, vilka som behöver förbättras och hur vi kan utveckla tjänsten för studenter, bostadssökande och samarbetspartners.</Td>
                  <Td>Berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Personalisering och rekommendationer</TdTitle>
                  <Td>Vi kan använda profilinformation, bostadspreferenser och beteendeinformation för att visa mer relevanta bostäder, köer, rekommendationer, påminnelser och innehåll i tjänsten.</Td>
                  <Td>Berättigat intresse och, när det krävs, samtycke</Td>
                </Tr>
                <Tr>
                  <TdTitle>Användarundersökningar och produktutveckling</TdTitle>
                  <Td>Vi kan behandla kontaktuppgifter och användningsdata för att genomföra enkäter, användartester och produktutvecklingsprojekt.</Td>
                  <Td>Berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Marknadsföring till användare</TdTitle>
                  <Td>Vi kan skicka tips, nyheter, erbjudanden och information om CampusLyan eller relevanta bostadsrelaterade tjänster. Du kan alltid tacka nej till direktmarknadsföring via avregistreringslänk, kontoinställningar om sådan funktion finns eller genom att kontakta oss.</Td>
                  <Td>Berättigat intresse och, när det krävs, samtycke</Td>
                </Tr>
                <Tr>
                  <TdTitle>Digital annonsering och mätning</TdTitle>
                  <Td>Vi kan använda cookies, pixlar och liknande teknik för att mäta och anpassa marknadsföring i digitala kanaler, exempelvis sociala medier, sökmotorer och annonseringsplattformar.</Td>
                  <Td>Samtycke när sådant krävs</Td>
                </Tr>
                <Tr>
                  <TdTitle>B2B-kontakter och samarbetspartners</TdTitle>
                  <Td>Vi behandlar kontaktuppgifter och företagsuppgifter för att marknadsföra våra tjänster till potentiella kunder och samarbetspartners, ingå och förvalta avtal, tillhandahålla support, anordna möten, följa upp samarbeten och utveckla affärsrelationer.</Td>
                  <Td>Berättigat intresse och, i vissa fall, fullgörande av avtal</Td>
                </Tr>
                <Tr>
                  <TdTitle>Rekrytering</TdTitle>
                  <Td>Vi behandlar personuppgifter för att genomföra och administrera rekryteringsprocesser, bedöma kandidater och kontakta referenser.</Td>
                  <Td>Berättigat intresse och, för framtida rekryteringar, samtycke</Td>
                </Tr>
                <Tr>
                  <TdTitle>Uppfyllande av rättsliga förpliktelser</TdTitle>
                  <Td>Vi behandlar personuppgifter när det krävs för att uppfylla rättsliga skyldigheter, exempelvis bokföring, myndighetsförfrågningar, skattekrav och hantering av registrerades rättigheter.</Td>
                  <Td>Rättslig förpliktelse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Rättsliga anspråk och tvister</TdTitle>
                  <Td>Vi kan behandla uppgifter för att fastställa, göra gällande eller försvara rättsliga anspråk.</Td>
                  <Td>Berättigat intresse</Td>
                </Tr>
                <Tr>
                  <TdTitle>Företagstransaktioner</TdTitle>
                  <Td>Vid eventuell sammanslagning, företagsöverlåtelse, investering, finansiering eller verksamhetsövergång kan personuppgifter behandlas och överföras i den utsträckning det är nödvändigt för transaktionen.</Td>
                  <Td>Berättigat intresse</Td>
                </Tr>
              </PolicyTable>
            </PolicySection>

            <PolicySection id="lagringstid" title="Hur länge sparar vi dina uppgifter?">
              <Paragraph>
                Vi sparar personuppgifter så länge det är nödvändigt för de ändamål som beskrivs i
                denna personuppgiftspolicy. Därefter raderas eller anonymiseras uppgifterna, om vi
                inte behöver spara dem längre enligt lag, för säkerhet, för att förebygga missbruk
                eller för att fastställa, göra gällande eller försvara rättsliga anspråk.
              </Paragraph>
              
              <PolicyTable columns={["Typ av uppgift", "Lagringstid"]}>
                <Tr>
                  <TdTitle>Kontouppgifter och profiluppgifter</TdTitle>
                  <Td>Så länge kontot är aktivt och därefter normalt upp till tolv (12) månader.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Sparade bostäder, bevakningar och bostadspreferenser</TdTitle>
                  <Td>Så länge kontot är aktivt och därefter normalt upp till tolv (12) månader.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Intresseanmälningar, köansökningar, bostadsansökningar och förfrågningar</TdTitle>
                  <Td>Så länge kontot är aktivt och därefter normalt upp till tjugofyra (24) månader.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Kö- och statusuppgifter</TdTitle>
                  <Td>Så länge funktionen är aktiv eller så länge kontot är aktivt, och därefter normalt upp till tolv (12) månader.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Verifieringsstatus</TdTitle>
                  <Td>Så länge kontot är aktivt eller så länge verifieringen behövs för aktuell funktion, och därefter normalt upp till tolv (12) månader.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Underlag som styrker studentstatus eller behörighet</TdTitle>
                  <Td>Endast så länge det behövs för kontrollen och normalt inte längre än sex (6) månader efter genomförd kontroll, om inte längre lagring krävs.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Supportärenden och kommunikation</TdTitle>
                  <Td>Normalt upp till tjugofyra (24) månader efter avslutat ärende.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Tekniska loggar och säkerhetsloggar</TdTitle>
                  <Td>Normalt upp till tolv (12) månader.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Marknadsföringsuppgifter</TdTitle>
                  <Td>Upp till två (2) år från din senaste användning av CampusLyan eller senaste kontakt med oss, om du inte dessförinnan motsätter dig behandlingen eller återkallar ett lämnat samtycke.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Kontaktpersoner hos bostadsföretag, fastighetsägare, studentkårer, fastighetssystem och samarbetspartners</TdTitle>
                  <Td>Så länge du är angiven som kontaktperson för en organisation som har en affärsrelation med CampusLyan och normalt ett (1) år därefter. För potentiella kunder och samarbetspartners sparas uppgifter normalt i två (2) år.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Avtal och avtalsrelaterade uppgifter</TdTitle>
                  <Td>Om dina personuppgifter förekommer i ett avtal sparas uppgifterna normalt under tio (10) år från det att avtalet löpt ut eller sagts upp.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Rekryteringsuppgifter</TdTitle>
                  <Td>Under rekryteringsprocessen och normalt två (2) år därefter. Om du har samtyckt till framtida rekryteringar kan uppgifterna sparas längre enligt ditt samtycke.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Räkenskapsinformation</TdTitle>
                  <Td>Till och med det sjunde (7) året efter utgången av det kalenderår då räkenskapsåret avslutades, enligt bokföringslagstiftning.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Begäran om att utöva rättigheter</TdTitle>
                  <Td>Normalt ett (1) år efter att vi hanterat din begäran.</Td>
                </Tr>
                <Tr>
                  <TdTitle>Uppgifter vid rättsligt anspråk eller tvist</TdTitle>
                  <Td>Så länge anspråket är aktuellt eller tvisten pågår och därefter så länge det är nödvändigt för att tillvarata våra rättsliga intressen.</Td>
                </Tr>
              </PolicyTable>
            </PolicySection>

            <PolicySection id="plats" title="Var behandlar vi dina personuppgifter?">
              <Paragraph>
                Vi strävar alltid efter att dina personuppgifter ska behandlas inom EU/EES och att
                våra egna IT-system ska finnas tillgängliga inom EU/EES.
              </Paragraph>
              
              <SubSection title="Överföring till leverantörer i tredjeländer">
                <Paragraph>
                  Vissa av våra leverantörer eller underleverantörer kan ha hela eller delar av sin
                  verksamhet i länder utanför EU/EES, så kallade tredjeländer. Oavsett vilket land
                  dina personuppgifter behandlas i vidtar vi juridiska, tekniska och organisatoriska
                  åtgärder för att säkerställa en skyddsnivå som motsvarar kraven enligt
                  dataskyddslagstiftningen.
                </Paragraph>
                <Paragraph>
                  Vid överföringar till länder utanför EU/EES använder vi lämpliga skyddsåtgärder
                  enligt GDPR. Det kan exempelvis innebära att vi stödjer oss på EU-kommissionens
                  adekvansbeslut, EU-kommissionens standardavtalsklausuler eller andra godkända
                  överföringsmekanismer. Vid behov vidtar vi även kompletterande skyddsåtgärder.
                </Paragraph>
              </SubSection>
            </PolicySection>

            <PolicySection id="rattigheter" title="Dina rättigheter">
              <Paragraph>
                Du har rätt att veta vad vi gör med dina personuppgifter. Du har också rätt att få
                tillgång till dina personuppgifter och i vissa fall få dem rättade, raderade eller
                begränsade.
              </Paragraph>
              <Paragraph>
                Varje personuppgiftsansvarig ansvarar för sin egen behandling. Om din begäran avser
                ett bostadsföretags, en fastighetsägares eller annan samarbetspartners behandling av
                personuppgifter, exempelvis uppgifter som redan har överförts till den parten eller
                uppgifter som finns i den partens egna system, behöver du normalt kontakta den parten
                direkt.
              </Paragraph>

              <SubSection title="Få tillgång till dina personuppgifter">
                <Paragraph>
                  Vi är öppna och transparenta med vilken information vi behandlar om dig. Om du har
                  ett användarkonto hos CampusLyan kan du logga in för att få en översikt över viss
                  information som finns registrerad om dig, exempelvis kontaktuppgifter, sparade
                  bostäder, bevakningar och aktuella eller tidigare intresseanmälningar, i den mån
                  sådan funktion finns.
                </Paragraph>
                <Paragraph>
                  Om du vill få en mer detaljerad inblick i vilka personuppgifter vi behandlar om dig
                  kan du begära tillgång till dessa uppgifter, ett så kallat registerutdrag. Du kan
                  begära ett sådant registerutdrag genom att kontakta oss. Eftersom vi har en
                  skyldighet att skydda dina personuppgifter från obehörig åtkomst kommer vi endast
                  att lämna ut sådana uppgifter som vi med säkerhet vet tillhör dig.
                </Paragraph>
              </SubSection>

              <SubSection title="Radera uppgifter">
                <Paragraph>
                  I vissa fall har du rätt att få dina personuppgifter raderade, exempelvis om
                  personuppgifterna inte längre är nödvändiga för de ändamål för vilka de samlades in,
                  om du återkallar ett samtycke och det inte finns någon annan rättslig grund för
                  behandlingen, eller om uppgifterna har behandlats olagligt.
                </Paragraph>
                <Paragraph>
                  Om du begär att vi raderar ditt konto eller dina personuppgifter hos CampusLyan
                  ansvarar vi för att radera eller anonymisera de personuppgifter som CampusLyan är
                  personuppgiftsansvarig för, om vi inte behöver spara uppgifterna enligt lag, för
                  säkerhet, för att förebygga missbruk eller för att tillvarata våra rättsliga
                  intressen.
                </Paragraph>
                <Paragraph>
                  Radering hos CampusLyan innebär inte automatiskt att personuppgifter som redan har
                  överförts till ett bostadsföretag, en fastighetsägare eller annan samarbetspartner
                  raderas hos den parten. Det innebär inte heller automatiskt att köuppgifter som
                  finns i den partens system raderas. Om du vill utöva dina rättigheter avseende den
                  partens behandling behöver du kontakta den parten direkt.
                </Paragraph>
                <Paragraph>
                  Om vi har anledning att tro att ett konto har använts i strid med våra villkor kan
                  vi i vissa fall behålla begränsad information under en rimlig tid efter radering i
                  syfte att upptäcka, utreda och förhindra missbruk av våra tjänster.
                </Paragraph>
              </SubSection>

              <SubSection title="Begär rättelse av personuppgifter">
                <Paragraph>
                  Om du anser att informationen om dig är felaktig eller ofullständig har du rätt att
                  begära att uppgifterna rättas eller kompletteras. Om du har ett användarkonto kan du
                  själv uppdatera viss information genom att logga in på ditt konto och ändra dina
                  kontoinställningar, i den mån sådan funktion finns. Om din begäran gäller andra
                  uppgifter kan du kontakta oss.
                </Paragraph>
              </SubSection>

              <SubSection title="Säg nej till direktmarknadsföring">
                <Paragraph>
                  Du kan när som helst säga nej till sådan behandling av personuppgifter som
                  CampusLyan gör för direktmarknadsföring, exempelvis utskick via e-post. Du kan
                  avregistrera dig genom att klicka på en länk i utskicket, ändra dina inställningar i
                  tjänsten om sådan funktion finns eller genom att kontakta oss.
                </Paragraph>
              </SubSection>

              <SubSection title="Invänd mot behandling (berättigat intresse)">
                <Paragraph>
                  Du har rätt att invända mot behandling av dina personuppgifter som vi gör med stöd
                  av vårt berättigade intresse. Om du invänder mot sådan behandling kan vi endast
                  fortsätta behandlingen om vi kan visa att det finns tvingande berättigade skäl för
                  att personuppgifterna måste behandlas och att dessa väger tyngre än dina intressen,
                  rättigheter och friheter.
                </Paragraph>
                <Paragraph>
                  Om du invänder mot viss behandling av personuppgifter gör vi en bedömning av bland
                  annat dina rimliga förväntningar, vilken typ av uppgifter behandlingen gäller, vilka
                  skyddsåtgärder som finns och vilka för- och nackdelar behandlingen innebär för dig,
                  CampusLyan, andra användare och eventuella tredje parter.
                </Paragraph>
              </SubSection>

              <SubSection title="Begränsa behandlingen av uppgifter">
                <Paragraph>
                  Du har rätt att begära att vår behandling av dina personuppgifter begränsas i vissa
                  situationer, exempelvis om du anser att uppgifterna är felaktiga, om behandlingen är
                  olaglig men du inte vill att uppgifterna raderas, eller om du har invänt mot
                  behandling som baseras på berättigat intresse.
                </Paragraph>
                <Paragraph>
                  Om du begär att behandlingen av dina uppgifter ska begränsas kan det innebära att
                  vissa funktioner i CampusLyan inte kan användas under tiden som behandlingen är
                  begränsad.
                </Paragraph>
              </SubSection>

              <SubSection title="Dataportabilitet">
                <Paragraph>
                  Du har i vissa fall rätt att få en kopia av dina personuppgifter i ett strukturerat,
                  allmänt använt och maskinläsbart format. Rätten till dataportabilitet omfattar
                  endast uppgifter som du själv har tillhandahållit oss och som vi behandlar
                  automatiserat för att fullgöra ett avtal med dig eller med stöd av ditt samtycke.
                </Paragraph>
              </SubSection>

              <SubSection title="Återkalla samtycke">
                <Paragraph>
                  Om vi behandlar personuppgifter med stöd av ditt samtycke har du rätt att när som
                  helst återkalla samtycket. Ett återkallande påverkar inte lagligheten av vår
                  behandling innan samtycket återkallades.
                </Paragraph>
              </SubSection>

              <SubSection title="Invänd mot automatiserade beslut">
                <Paragraph>
                  Du har rättigheter enligt GDPR om du blir föremål för ett beslut som enbart grundas
                  på automatiserad behandling och som har rättsliga följder för dig eller på liknande
                  sätt i betydande grad påverkar dig.
                </Paragraph>
                <Paragraph>
                  CampusLyan använder inte automatiserat beslutsfattande för att besluta vem som får
                  en bostad. Om vi i framtiden skulle använda automatiserat beslutsfattande som
                  omfattas av särskilda regler enligt GDPR kommer vi att informera dig om detta och
                  säkerställa att det finns stöd enligt lag.
                </Paragraph>
              </SubSection>

              <SubSection title="Kontakta tillsynsmyndigheten">
                <Paragraph>
                  Om du anser att CampusLyan hanterar personuppgifter felaktigt har du rätt att lämna
                  in ett klagomål till tillsynsmyndigheten för dataskydd.
                </Paragraph>
                <Paragraph>
                  Integritetsskyddsmyndigheten, IMY, är svensk tillsynsmyndighet för dataskydd. Du
                  hittar mer information på imy.se.
                </Paragraph>
              </SubSection>
            </PolicySection>

            <PolicySection id="mottagare" title="Till vem kan personuppgifter lämnas ut?">
              <Paragraph>
                Vi delar information om dig med vissa tredje parter när det är nödvändigt för att
                tillhandahålla våra tjänster, när det krävs enligt lag eller när du själv har begärt
                eller godkänt sådan delning. Här kan du läsa mer om vem vi lämnar ut personuppgifter
                till.
              </Paragraph>

              <SubSection title="Bostadsföretag, fastighetsägare och andra bostadsaktörer">
                <Paragraph>
                  När du aktivt väljer att lämna en intresseanmälan, köansökan, bostadsansökan eller
                  annan förfrågan till ett anslutet bostadsföretag, en fastighetsägare eller annan
                  bostadsaktör genom CampusLyan kan vi överföra de personuppgifter som är nödvändiga
                  för att mottagaren ska kunna hantera din förfrågan.
                </Paragraph>
                <Paragraph>
                  Det kan exempelvis omfatta namn, kontaktuppgifter, verifieringsstatus, studentstatus,
                  uppgifter om den bostad du är intresserad av, meddelanden och andra uppgifter som är
                  nödvändiga för att mottagaren ska kunna hantera intresseanmälan, bostadsansökan,
                  köansökan, urval, erbjudande om bostad eller fortsatt uthyrningsprocess.
                </Paragraph>
                <Paragraph>
                  CampusLyan beslutar inte vem som får en bostad och gör inte det slutliga urvalet i
                  uthyrningsprocessen. Det aktuella bostadsföretaget, fastighetsägaren eller
                  samarbetspartnern ansvarar själv för sin bostadskö, sina krav, sitt urval, sina
                  erbjudanden, sin avtalshantering och sin fortsatta behandling av personuppgifter.
                </Paragraph>
                <Paragraph>
                  Efter att uppgifterna har mottagits behandlar bostadsföretaget, fastighetsägaren
                  eller samarbetspartnern normalt uppgifterna som självständig personuppgiftsansvarig
                  enligt sin egen integritetspolicy.
                </Paragraph>
              </SubSection>

              <SubSection title="Hämtning av köuppgifter från bostadsföretag m.fl.">
                <Paragraph>
                  Om du aktivt begär, godkänner eller initierar det kan CampusLyan hämta eller ta emot
                  uppgifter om din befintliga köstatus hos ett anslutet bostadsföretag, en
                  fastighetsägare eller annan samarbetspartner. Sådana uppgifter kan exempelvis avse
                  ködagar, köpoäng, köregistreringsdatum, köstatus, kömedlemskap eller annan
                  motsvarande information som är nödvändig för funktionen.
                </Paragraph>
                <Paragraph>
                  CampusLyan behandlar sådana uppgifter för att visa din köstatus i plattformen, ge
                  dig en översikt över dina bostadsköer, möjliggöra bevakning, påminnelser, matchning
                  och annan funktionalitet kopplad till ditt bostadssökande.
                </Paragraph>
              </SubSection>

              <SubSection title="Externa webbplatser och vidare hänvisning">
                <Paragraph>
                  Om CampusLyan endast länkar dig vidare till ett bostadsföretags, en fastighetsägares
                  eller en samarbetspartners egen webbplats, och du själv lämnar dina uppgifter direkt
                  till den parten, ansvarar den parten själv för insamlingen och den fortsatta
                  behandlingen av dina personuppgifter.
                </Paragraph>
              </SubSection>

              <SubSection title="Leverantörer som behandlar personuppgifter för vår räkning">
                <Paragraph>
                  Vi behöver ibland anlita leverantörer för att leverera våra tjänster till dig. Sådana
                  leverantörer kan exempelvis leverera molntjänster, datalagring, e-postutskick,
                  pushnotiser, analysverktyg, supportverktyg, säkerhetslösningar, utveckling, drift,
                  fakturering och bokföring.
                </Paragraph>
                <Paragraph>
                  Vi är ansvariga för den behandling av personuppgifter som sker av våra
                  personuppgiftsbiträden för vår räkning. Leverantörerna får endast behandla
                  personuppgifter enligt våra instruktioner och får inte använda uppgifterna för egna
                  ändamål.
                </Paragraph>
              </SubSection>

              <SubSection title="Verifieringstjänster">
                <Paragraph>
                  Vi kan dela personuppgifter med leverantörer av verifieringstjänster, exempelvis
                  Freja eller annan motsvarande tjänst, i den utsträckning det är nödvändigt för att
                  verifiera identitet, studentstatus eller behörighet. Verifieringstjänsten kan även
                  behandla personuppgifter som självständig personuppgiftsansvarig enligt sina egna
                  villkor och sin egen integritetspolicy.
                </Paragraph>
              </SubSection>

              <SubSection title="Studentkårer och samarbetspartners">
                <Paragraph>
                  Om du använder funktioner, kampanjer eller tjänster som tillhandahålls tillsammans
                  med studentkårer eller andra samarbetspartners kan vi dela de uppgifter som är
                  nödvändiga för att tillhandahålla funktionen eller samarbetet. Vi ingår avtal för att
                  säkerställa att sådana samarbetspartners behandlar personuppgifter i enlighet med
                  gällande dataskyddslagstiftning.
                </Paragraph>
              </SubSection>

              <SubSection title="Myndigheter">
                <Paragraph>
                  Vi lämnar ut personuppgifter till myndigheter, domstolar eller andra mottagare om vi
                  är skyldiga att göra det enligt lag, myndighetsbeslut eller domstolsbeslut. Vi kan
                  även lämna ut uppgifter när det är nödvändigt för att tillvarata våra rättsliga
                  intressen eller bidra till en pågående utredning där det finns rättsligt stöd.
                </Paragraph>
              </SubSection>

              <SubSection title="Rådgivare, investerare och företagstransaktioner">
                <Paragraph>
                  Om hela eller delar av CampusLyans verksamhet säljs, överlåts, slås samman,
                  finansieras eller integreras med annan verksamhet kan personuppgifter lämnas ut till
                  våra rådgivare, potentiella köpare, investerare och deras rådgivare, i den
                  utsträckning det är nödvändigt för transaktionen.
                </Paragraph>
              </SubSection>

              <SubSection title="Annonsörer och annonsnätverk">
                <Paragraph>
                  Vi kan dela vissa uppgifter med annonsörer, annonsnätverk och analysleverantörer för
                  att mäta, analysera och anpassa vår marknadsföring, i den mån detta är tillåtet
                  enligt tillämplig lag och, när det krävs, baserat på ditt samtycke.
                </Paragraph>
                <Paragraph>
                  Vi säljer inte marknadsföringslistor till tredje part för deras egna
                  marknadsföringsändamål.
                </Paragraph>
                <Paragraph>
                  Vi kommer inte att dela, sälja, överföra eller på annat sätt lämna ut
                  personuppgifter utöver vad som anges i denna personuppgiftspolicy, om vi inte är
                  skyldiga att göra det på grund av en rättslig förpliktelse eller om vi först har
                  inhämtat ditt samtycke.
                </Paragraph>
              </SubSection>
            </PolicySection>

            <PolicySection id="cookies" title="Användningen av kakor och spårningsteknik">
              <Paragraph>
                När du besöker vår webbplats eller använder våra tjänster, appar, meddelandesystem,
                e-postmeddelanden eller verktyg kan CampusLyan eller våra partners använda kakor,
                pixlar eller liknande spårningsteknik för att lagra eller hämta information för olika
                ändamål såsom funktionalitet, analys, statistik, produktutveckling, rapportering,
                resultatmätning, annonsering, personalisering och marknadsföring.
              </Paragraph>
              <Paragraph>
                Användningen av kakor och liknande spårningsteknik regleras bland annat av lagen om
                elektronisk kommunikation och gällande dataskyddsregler.
              </Paragraph>

              <SubSection title="Vad är kakor, pixlar och liknande spårningsteknik?">
                <Paragraph>
                  Som de flesta webbplatser använder vi teknik som består av små textfiler eller
                  tekniska identifierare som placeras på din dator, surfplatta eller mobiltelefon,
                  eller lagras i din webbläsare, när du besöker eller interagerar med våra webbplatser,
                  tjänster, appar, meddelandesystem eller verktyg.
                </Paragraph>
                <Paragraph>
                  <strong className="font-semibold text-foreground">Kakor:</strong> små textfiler,
                  vanligtvis bestående av bokstäver och siffror, som placeras i minnet hos din
                  webbläsare eller i din enhet när du besöker en webbplats eller läser ett meddelande.
                  Kakor gör det möjligt för en webbplats att känna igen en viss enhet eller webbläsare.
                </Paragraph>
                <Paragraph>
                  Det finns flera olika typer av kakor. Tillfälliga kakor, även kallade sessionskakor,
                  avslutas när du stänger webbläsaren och gör det möjligt för oss att komma ihåg din
                  aktivitet medan du använder webbplatsen. Bestående kakor lagras på din enhet under
                  en viss tid och gör det möjligt för oss att komma ihåg dina preferenser eller din
                  aktivitet över flera besök. Förstapartskakor sätts av den webbplats du besöker,
                  exempelvis CampusLyans webbplats. Tredjepartskakor sätts av en tredje part och kan
                  användas exempelvis för analys, annonsering eller integrerade tjänster.
                </Paragraph>
                <Paragraph>
                  Kakor kan normalt stängas av eller raderas genom verktyg som finns i de flesta
                  webbläsare. Olika webbläsare erbjuder olika val för att hantera eller blockera kakor.
                </Paragraph>
                <Paragraph>
                  <strong className="font-semibold text-foreground">Pixlar:</strong> små grafiska
                  bilder eller kodsnuttar som kan inkluderas på våra webbplatser, i våra tjänster,
                  appar, meddelandesystem eller e-postmeddelanden. Pixlar kan användas för att mäta
                  exempelvis om ett e-postmeddelande har öppnats, om en annons har visats eller hur
                  användare interagerar med vår webbplats.
                </Paragraph>
                <Paragraph>
                  <strong className="font-semibold text-foreground">
                    Liknande teknik för att lagra information:
                  </strong>{" "}
                  teknik som lagrar information i din webbläsare eller enhet och som kan använda lokal
                  lagring, sessionslagring eller andra tekniska lösningar. Vi kan använda sådana
                  tekniker för att exempelvis hålla dig inloggad, spara inställningar, skydda ditt
                  konto, upptäcka ovanligt beteende och utvärdera prestandan i våra tjänster.
                </Paragraph>
              </SubSection>

              <SubSection title="Dina val och vår användning">
                <Paragraph>
                  På våra webbplatser erbjuder vi funktioner, tjänster och verktyg som i vissa fall är
                  beroende av kakor och liknande teknik. Vi inhämtar ditt samtycke till kakor första
                  gången du besöker våra webbplatser, i den mån samtycke krävs. När du har lämnat ditt
                  samtycke kan du ändra dina inställningar när som helst.
                </Paragraph>
                <Paragraph>
                  Kakor och liknande teknik kan ofta blockeras i webbläsarens inställningar eller i
                  din mobila plattform. Om du blockerar viss teknik kan det påverka funktionaliteten på
                  våra webbplatser eller innebära att vissa funktioner inte går att använda,
                  exempelvis inloggning, sparade sökningar eller personliga inställningar.
                </Paragraph>
              </SubSection>

              <SubSection title="Kategorier av teknik">
                <Paragraph>
                  <strong className="font-semibold text-foreground">Nödvändiga:</strong> Vi kan
                  använda kakor eller annan liknande teknik som är nödvändig för att våra webbplatser,
                  tjänster och verktyg ska fungera. Detta inkluderar teknik som ger dig åtkomst till
                  tjänsten, håller dig inloggad, sparar säkerhetsinställningar, motverkar missbruk och
                  förbättrar säkerheten.
                </Paragraph>
                <Paragraph>
                  <strong className="font-semibold text-foreground">Analys och produktutveckling:</strong>{" "}
                  Vi kan använda kakor och annan liknande teknik för att utvärdera prestandan hos våra
                  webbplatser, tjänster och verktyg. Detta inkluderar analysarbete för att förstå hur
                  besökare använder våra webbplatser, vilka funktioner som används och hur vi kan
                  förbättra innehåll, funktionalitet och användarupplevelse.
                </Paragraph>
                <Paragraph>
                  <strong className="font-semibold text-foreground">Personalisering:</strong> Vi kan
                  använda kakor och annan liknande teknik för att erbjuda förbättrad funktionalitet när
                  du använder CampusLyan. Det kan exempelvis handla om att känna igen dig när du
                  loggar in, komma ihåg dina preferenser, visa sparade sökningar eller anpassa
                  innehåll och bostadsrekommendationer efter dina val och intressen.
                </Paragraph>
                <Paragraph>
                  <strong className="font-semibold text-foreground">Marknadsföring:</strong> Vi kan
                  använda kakor och annan liknande teknik för att anpassa marknadsföring i olika
                  kanaler såsom e-post, sociala medier, sökmotorer och digitala annonseringsplattformar
                  baserat på dina intressen och din användning av våra tjänster.
                </Paragraph>
                <Paragraph>
                  <strong className="font-semibold text-foreground">Annonsering:</strong> Vi kan
                  använda förstapartskakor eller tredjepartskakor samt pixlar för att leverera innehåll
                  på våra eller tredje parters webbplatser, inklusive annonser som är relevanta baserat
                  på dina intressen. Detta kan även användas för att mäta effektiviteten av annonser
                  och innehåll som visas för dig.
                </Paragraph>
              </SubSection>
            </PolicySection>

            <PolicySection id="kontakt" title="Kontakt vid frågor">
              <SubSection title="Kontakta oss">
                <Paragraph>
                  Vi arbetar kontinuerligt för att säkerställa att behandlingen av dina uppgifter sker
                  på ett lagligt, säkert och transparent sätt. Du kan alltid kontakta oss om du har
                  frågor om denna personuppgiftspolicy eller om hur vi behandlar dina personuppgifter.
                </Paragraph>
                <Paragraph>
                  Skicka ett e-postmeddelande till:{" "}
                  <a className="font-medium text-foreground underline-offset-4 hover:underline" href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                </Paragraph>
              </SubSection>

              <SubSection title="Uppdateringar av denna policy">
                <Paragraph>
                  Om vi gör ändringar i denna integritetspolicy kommer vi att publicera en uppdaterad
                  version på CampusLyans webbplats. Vid större förändringar, eller om ändringen
                  påverkar dig på ett väsentligt sätt, kan vi även informera dig separat, exempelvis via
                  e-post, i plattformen eller genom annan tydlig information.
                </Paragraph>
              </SubSection>
            </PolicySection>

          </article>
        </div>
      </section>
    </main>
  );
}

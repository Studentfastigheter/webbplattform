import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Användarvillkor",
  description: "Användarvillkor för CampusLyan.",
  alternates: {
    canonical: "/anvandarvillkor",
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

/* --- Huvudsida --- */

export default function AnvandarvillkorPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* Sidhuvud */}
      <section className="border-b border-border bg-muted/10 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Användarvillkor 
          </h1>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Senast uppdaterad den 21/5-2026
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
                  <SidebarLink href="#allmant">1. Allmänt</SidebarLink>
                  <SidebarLink href="#konto">2. Användarkonto och behörighet</SidebarLink>
                  <SidebarLink href="#bostader">3. Bostäder & information</SidebarLink>
                  <SidebarLink href="#ansokningar">4. Intresseanmälningar</SidebarLink>
                  <SidebarLink href="#avstamning">5. Avstämning & verifiering</SidebarLink>
                  <SidebarLink href="#kofunktioner">6. Köfunktioner</SidebarLink>
                  <SidebarLink href="#var-roll">7. Vår roll och kundtjänst</SidebarLink>
                  <SidebarLink href="#reklam">8. Reklam och samarbeten</SidebarLink>
                  <SidebarLink href="#personuppgifter">9. Personuppgifter</SidebarLink>
                  <SidebarLink href="#anvandning">10. Användning av Tjänsten</SidebarLink>
                  <SidebarLink href="#immateriella">11. Immateriella rättigheter</SidebarLink>
                  <SidebarLink href="#ansvar">12. Ansvar och övriga villkor</SidebarLink>
                  <SidebarLink href="#andringar">13. Ändring av villkor</SidebarLink>
                  <SidebarLink href="#tvist">14. Gällande lag och tvist</SidebarLink>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Texter */}
          <article className="w-full min-w-0">
            
            <PolicySection id="allmant" title="1. Allmänt">
              <Paragraph>
                CampusLyan tillhandahåller en digital plattform där studenter och andra bostadssökande kan hitta, bevaka och få överblick över studentbostäder, bostadsköer och annan bostadsrelaterad information.
              </Paragraph>
              <Paragraph>
                Genom Tjänsten kan användare bland annat skapa en profil, spara bostäder, skapa bevakningar, ta del av information om bostadsköer, anmäla intresse för bostäder, länkas vidare till externa bostadsaktörer och, i den omfattning funktionerna finns tillgängliga, hantera eller visa relevant köinformation.
              </Paragraph>
              <Paragraph>
                Dessa användarvillkor reglerar din användning av vår webbplats www.campuslyan.se och de tjänster som CampusLyan Nordics AB, (org.nr. 559587-0048), ("vi", "oss", "vår" eller "CampusLyan") tillhandahåller. Webbplatsen, plattformen och tillhörande tjänster benämns gemensamt som "Tjänsten".
              </Paragraph>
              <Paragraph>
                Genom att skapa ett användarkonto eller använda Tjänsten accepterar du dessa användarvillkor.
              </Paragraph>
              <Paragraph>
                CampusLyan är inte hyresvärd, bostadsförmedling i juridisk mening, ombud för hyresvärdar eller part i något hyresavtal. CampusLyan tillhandahåller en teknisk plattform och marknadsplats som gör det enklare för studenter och andra bostadssökande att hitta relevant bostadsinformation, få överblick över bostadsköer och komma i kontakt med bostadsföretag, fastighetsägare och andra bostadsaktörer.
              </Paragraph>
            </PolicySection>

            <PolicySection id="konto" title="2. Användarkonto och behörighet">
              <Paragraph>
                För att skapa ett användarkonto och använda Tjänstens inloggade funktioner behöver du som huvudregel ha fyllt 18 år.
              </Paragraph>
              <Paragraph>
                Varje person får ha högst ett konto hos CampusLyan. Ditt användarkonto är personligt och får endast användas av dig. Du får inte överlåta, låna ut eller ge någon annan tillgång till ditt konto.
              </Paragraph>
              <Paragraph>
                För att säkerställa att användare är verkliga personer och för att kunna tillhandahålla vissa funktioner kan CampusLyan använda verifieringstjänster, exempelvis Freja, BankID eller andra motsvarande identifierings- och verifieringslösningar. Vissa funktioner kan även kräva att du verifierar din studentstatus eller lämnar annan information som visar att du uppfyller krav för studentbostäder eller andra bostäder.
              </Paragraph>
              <Paragraph>
                Du ansvarar för att de uppgifter som du lämnar till CampusLyan är korrekta, fullständiga och uppdaterade. Du åtar dig att uppdatera dina uppgifter om de förändras, exempelvis kontaktuppgifter, studieort, studentstatus, bostadspreferenser eller annan information som kan påverka din användning av Tjänsten.
              </Paragraph>
              <Paragraph>
                Du ansvarar för att hålla dina inloggningsuppgifter säkra och för att omedelbart meddela CampusLyan om du misstänker att någon obehörig har fått tillgång till ditt konto.
              </Paragraph>
              <Paragraph>
                Ditt användarkonto får endast användas för privata ändamål och får inte användas i affärsverksamhet, för kommersiella ändamål, automatiserad insamling av information, vidarepublicering av innehåll eller på annat sätt som strider mot dessa villkor.
              </Paragraph>
              <Paragraph>
                CampusLyan har vid var tid rätt att bestämma hur Tjänsten ska fungera och i vilken omfattning olika funktioner ska finnas tillgängliga. Funktioner kan läggas till, ändras, begränsas eller tas bort över tid.
              </Paragraph>
              <Paragraph>
                Om du inte har loggat in på ditt konto under en längre period kan CampusLyan komma att begränsa, inaktivera eller radera kontot och tillhörande uppgifter i enlighet med vår integritetspolicy. Om Tjänsten innehåller påminnelser, bevakningar eller köfunktioner kan dessa sluta fungera om kontot är inaktivt.
              </Paragraph>
              <Paragraph>
                CampusLyan tilldelar inte egna köpoäng eller ködagar, om inte detta uttryckligen anges för en särskild funktion. Köpoäng, ködagar, köplaceringar och motsvarande uppgifter hos externa bostadsföretag, fastighetsägare eller bostadsköer regleras alltid av respektive extern aktörs egna villkor, regler och system.
              </Paragraph>
            </PolicySection>

            <PolicySection id="bostader" title="3. Bostäder, bostadsköer och information i Tjänsten">
              <Paragraph>
                CampusLyan kan visa information om bostäder, bostadsköer, bostadsföretag, fastighetsägare, studentkårer, samarbetspartners och andra externa aktörer. Informationen kan komma från CampusLyan, anslutna bostadsföretag, fastighetsägare, fastighetssystem, samarbetspartners, publika källor eller andra externa källor.
              </Paragraph>
              <Paragraph>
                CampusLyan strävar efter att informationen i Tjänsten ska vara korrekt och uppdaterad, men garanterar inte att information om bostäder, hyror, tillgänglighet, köer, krav, ansökningstider, kontaktuppgifter eller andra uppgifter alltid är fullständig, korrekt eller aktuell.
              </Paragraph>
              <Paragraph>
                Bostäder kan ändras, hyras ut, avpubliceras eller bli otillgängliga utan att detta omedelbart framgår i Tjänsten. Krav för att få söka eller hyra en viss bostad kan också ändras av den aktuella bostadsaktören.
              </Paragraph>
              <Paragraph>
                Du ansvarar själv för att kontrollera informationen hos det aktuella bostadsföretaget, fastighetsägaren eller samarbetspartnern innan du anmäler intresse, ansöker om bostad, accepterar ett erbjudande eller ingår avtal.
              </Paragraph>
              <Paragraph>
                CampusLyan ansvarar inte för innehållet i bostadsannonser, externa bostadsköer, uthyrningsvillkor, hyresavtal, kommunikation från externa aktörer eller information som tillhandahålls av bostadsföretag, fastighetsägare eller andra samarbetspartners.
              </Paragraph>
            </PolicySection>

            <PolicySection id="ansokningar" title="4. Intresseanmälningar, ansökningar och vidarehänvisning">
              <Paragraph>
                Genom Tjänsten kan du anmäla intresse för bostäder, skicka förfrågningar, ansöka om bostäder, registrera intresse för bostadsköer eller länkas vidare till externa bostadsaktörer.
              </Paragraph>
              <Paragraph>
                När du anmäler intresse för en bostad eller använder en funktion som innebär att uppgifter skickas till ett bostadsföretag, en fastighetsägare eller annan samarbetspartner, ansvarar du för att de uppgifter du lämnar är korrekta, fullständiga och aktuella.
              </Paragraph>
              <Paragraph>
                CampusLyan kan, om du själv initierar det, vidarebefordra de uppgifter som behövs till den aktuella bostadsaktören. Det kan exempelvis avse kontaktuppgifter, studentstatus, verifieringsstatus, uppgifter om bostaden du är intresserad av, meddelanden eller annan information som krävs för att hantera din förfrågan.
              </Paragraph>
              <Paragraph>
                Om en bostad, bostadskö eller ansökan hanteras på en extern webbplats kan CampusLyan i stället länka dig vidare dit. I sådana fall ansvarar den externa aktören för den fortsatta processen och för den information du lämnar direkt till den externa aktören.
              </Paragraph>
              <Paragraph>
                En intresseanmälan, ansökan, köregistrering eller annan åtgärd via CampusLyan innebär inte att du har rätt till en bostad, köplats, visning, erbjudande eller hyresavtal.
              </Paragraph>
              <Paragraph>
                Det aktuella bostadsföretaget, fastighetsägaren eller samarbetspartnern ansvarar själv för sin kö, sitt urval, sina krav, sin kommunikation, sina erbjudanden och sina avtal. CampusLyan kan inte garantera att en intresseanmälan, ansökan eller förfrågan leder till återkoppling, visning, erbjudande eller avtal.
              </Paragraph>
            </PolicySection>

            <PolicySection id="avstamning" title="5. Avstämning, verifiering och beslutsstöd">
              <Paragraph>
                CampusLyan kan tillhandahålla funktioner som hjälper dig att förstå vilka bostäder, bostadsköer eller bostadsaktörer som kan vara relevanta för dig. Sådana funktioner kan exempelvis baseras på dina bostadspreferenser, studieort, lärosäte, studentstatus, verifieringsstatus, sparade bostäder, användning av Tjänsten eller andra uppgifter som du lämnar.
              </Paragraph>
              <Paragraph>
                CampusLyan kan även visa om du uppfyller vissa grundläggande krav som anges av en bostadsaktör, exempelvis krav på studentstatus, ålder, studieort, lärosäte, kömedlemskap eller andra uppgifter.
              </Paragraph>
              <Paragraph>
                Sådana avstämningar, rekommendationer, matchningar eller indikationer är endast beslutsstöd och servicefunktioner. De innebär inte att CampusLyan fattar beslut om din rätt till bostad, att du uppfyller samtliga krav eller att du kommer att få ett erbjudande.
              </Paragraph>
              <Paragraph>
                Det är alltid det aktuella bostadsföretaget, fastighetsägaren eller samarbetspartnern som gör det slutliga urvalet och beslutar om köplacering, behörighet, erbjudande, tilldelning och hyresavtal enligt sina egna regler och processer.
              </Paragraph>
              <Paragraph>
                CampusLyan kan använda automatiserade verktyg, algoritmer eller AI-baserade funktioner för att förbättra sökresultat, rekommendationer, bevakningar, matchning, säkerhet, support och produktutveckling. CampusLyan använder inte automatiserat beslutsfattande för att besluta vem som får en bostad.
              </Paragraph>
            </PolicySection>

            <PolicySection id="kofunktioner" title="6. Köfunktioner och externa bostadsköer">
              <Paragraph>
                CampusLyan erbjuder funktioner som gör det möjligt för dig att få överblick över relevanta bostadsköer, spara köer, bevaka köer, få påminnelser, se information om kövillkor eller, om funktionen finns tillgänglig, visa eller hämta köstatus från externa bostadsaktörer.
              </Paragraph>
              <Paragraph>
                Om du använder en funktion där CampusLyan hämtar eller visar köuppgifter från ett bostadsföretag, en fastighetsägare eller annan extern bostadskö sker detta endast när du själv initierar, godkänner eller använder funktionen. Sådana uppgifter kan exempelvis avse ködagar, köpoäng, köregistreringsdatum, köstatus, kömedlemskap eller liknande information.
              </Paragraph>
              <Paragraph>
                CampusLyan ansvarar inte för riktigheten, fullständigheten eller aktualiteten i köuppgifter som tillhandahålls av externa aktörer. CampusLyan ansvarar inte heller för ändringar, avbrott, tekniska fel, regeländringar, aktivitetskrav eller andra förhållanden hos externa bostadsaktörer eller bostadsköer.
              </Paragraph>
              <Paragraph>
                Du ansvarar själv för att följa respektive bostadsaktörs villkor, aktivitetskrav, uppdateringskrav och ansökningsprocesser. Om en extern bostadskö kräver att du loggar in, uppdaterar uppgifter, bekräftar köplats eller vidtar andra åtgärder ansvarar du själv för att detta görs i tid, om inte CampusLyan uttryckligen tillhandahåller en funktion som omfattar sådan åtgärd.
              </Paragraph>
              <Paragraph>
                CampusLyan garanterar inte att en köregistrering kan genomföras, att en befintlig köplats behålls, att köuppgifter kan hämtas eller att en viss köstatus ger rätt till bostad.
              </Paragraph>
            </PolicySection>

            <PolicySection id="var-roll" title="7. Vår roll och kundtjänst">
              <Paragraph>
                CampusLyan tillhandahåller en teknisk plattform och marknadsplats som förenklar för studenter och andra bostadssökande att hitta bostadsinformation, upptäcka bostadsköer och komma i kontakt med bostadsaktörer.
              </Paragraph>
              <Paragraph>
                Vi är inte ombud för vare sig bostadsföretag, fastighetsägare, samarbetspartners eller dig som användare. Vi kan därför inte binda någon part till avtal och är inte part i något hyresavtal, köavtal, förmedlingsavtal eller annan överenskommelse mellan dig och en bostadsaktör.
              </Paragraph>
              <Paragraph>
                Bostadsföretag, fastighetsägare och andra samarbetspartners ansvarar själva för sina annonser, bostadsköer, krav, urval, kommunikation, erbjudanden, hyresavtal, kundrelationer och övriga processer.
              </Paragraph>
              <Paragraph>
                CampusLyans kundtjänst kan hjälpa till med frågor som rör användningen av Tjänsten, ditt konto, tekniska problem, sparade bostäder, bevakningar, notifieringar och andra funktioner som CampusLyan tillhandahåller.
              </Paragraph>
              <Paragraph>
                Om din fråga gäller en specifik bostad, köplacering, urval, erbjudande, hyresavtal eller beslut från en bostadsaktör behöver du normalt kontakta den aktuella aktören direkt.
              </Paragraph>
            </PolicySection>

            <PolicySection id="reklam" title="8. Reklam, samarbeten och kampanjer">
              <Paragraph>
                CampusLyan kan visa reklam, sponsrat innehåll, partnererbjudanden, kampanjer eller information från samarbetspartners i Tjänsten.
              </Paragraph>
              <Paragraph>
                CampusLyan ansvarar inte för externa erbjudanden, produkter eller tjänster från tredje part, om inte annat uttryckligen anges. Om du väljer att ta del av ett erbjudande från en tredje part kan den tredje partens egna villkor och integritetspolicy gälla.
              </Paragraph>
              <Paragraph>
                CampusLyan kan komma att begränsa funktioner eller upplevelsen i Tjänsten om tekniska lösningar som är nödvändiga för att visa, mäta eller finansiera Tjänsten blockeras, exempelvis genom annonsblockering, i den utsträckning detta är tillåtet enligt lag.
              </Paragraph>
            </PolicySection>

            <PolicySection id="personuppgifter" title="9. Behandling av personuppgifter">
              <Paragraph>
                CampusLyans behandling av personuppgifter sker i enlighet med vår integritetspolicy. Genom att använda Tjänsten bekräftar du att du har tagit del av informationen om hur CampusLyan behandlar personuppgifter. Integritetspolicyn finns tillgänglig på CampusLyans webbplats.
              </Paragraph>
              <Paragraph>
                Om du använder funktioner som innebär att personuppgifter lämnas till ett bostadsföretag, en fastighetsägare eller annan samarbetspartner kan även den partens integritetspolicy och villkor gälla för den fortsatta behandlingen.
              </Paragraph>
            </PolicySection>

            <PolicySection id="anvandning" title="10. Användning av Tjänsten">
              <Paragraph>
                Du får endast använda Tjänsten för avsett ändamål och i enlighet med tillämplig lagstiftning, dessa användarvillkor och övriga instruktioner, riktlinjer eller villkor som anges i Tjänsten eller på annat sätt meddelas av CampusLyan.
              </Paragraph>
              <Paragraph>
                Du får inte använda Tjänsten för att lämna oriktiga, vilseledande, ofullständiga eller olagliga uppgifter. Du får inte heller använda Tjänsten för att utge dig för att vara någon annan, skapa falska konton, kringgå verifieringskrav, manipulera köinformation, skicka otillåten kommunikation eller på annat sätt missbruka Tjänsten.
              </Paragraph>
              <Paragraph>
                Du får inte publicera, ladda upp, skicka eller på annat sätt tillhandahålla innehåll som är olagligt, stötande, hotfullt, trakasserande, diskriminerande, vilseledande, integritetskränkande, gör intrång i annans rätt eller annars strider mot dessa villkor.
              </Paragraph>
              <Paragraph>
                Du får inte bryta mot, kringgå, ta bort, manipulera eller påverka den teknik, de begränsningar eller de säkerhetssystem som CampusLyan använder för att skydda Tjänsten, våra användare, våra samarbetspartners eller vårt innehåll.
              </Paragraph>
              <Paragraph>
                Du får inte agera på ett sätt som kan innebära att Tjänsten sätts ur funktion, överbelastas, försämras, skadas eller används på ett sätt som kan orsaka skada för CampusLyan, Tjänsten, andra användare eller samarbetspartners.
              </Paragraph>
              <Paragraph>
                Du får inte använda robotar, spindlar, scrapingverktyg, automatiserade script, datainsamling eller andra automatiserade metoder för att kopiera, extrahera, indexera, övervaka eller på annat sätt samla in information från Tjänsten utan vårt skriftliga godkännande.
              </Paragraph>
              <Paragraph>
                CampusLyan förbehåller sig rätten att granska användare, konton, aktivitet och innehåll i Tjänsten i syfte att upptäcka och förhindra missbruk, tekniska angrepp, falska konton, otillåten användning eller överträdelser av dessa villkor. Sådan granskning kan ske manuellt av behörig personal eller med hjälp av automatiserade verktyg.
              </Paragraph>
              <Paragraph>
                CampusLyan har rätt att ta bort, begränsa eller ändra innehåll, stoppa meddelanden, neka funktioner, begränsa åtkomst, stänga av konton eller avsluta konton om vi bedömer att innehåll, aktivitet eller användning strider mot dessa villkor, tillämplig lag, tredje parts rättigheter eller CampusLyans säkerhets- och kvalitetskrav.
              </Paragraph>
              <Paragraph>
                Om du använder Tjänsten i strid med dessa användarvillkor eller på ett sätt som rimligen kan orsaka CampusLyan, Tjänsten, andra användare eller samarbetspartners skada har CampusLyan rätt att stänga av eller avsluta ditt konto utan skyldighet att ersätta dig för detta.
              </Paragraph>
              <Paragraph>
                CampusLyan har rätt, men inte skyldighet, att rapportera misstänkt olaglig aktivitet till berörda myndigheter eller andra berörda parter om det finns rättsligt stöd för detta.
              </Paragraph>
            </PolicySection>

            <PolicySection id="immateriella" title="11. Immateriella rättigheter">
              <Paragraph>
                CampusLyan och/eller dess licensgivare innehar samtliga rättigheter, inklusive immateriella rättigheter, till Tjänsten och dess innehåll, funktioner, design, struktur, varumärken, kännetecken, databasstruktur, programvara, källkod, texter, grafiskt material och annat material som tillhandahålls av CampusLyan.
              </Paragraph>
              <Paragraph>
                Du får en begränsad, icke-exklusiv, icke-överlåtbar och återkallelig rätt att använda Tjänsten i enlighet med dessa villkor under den tid du har ett aktivt konto eller annars använder Tjänsten på tillåtet sätt.
              </Paragraph>
              <Paragraph>
                Du får inte kopiera, ändra, översätta, reproducera, distribuera, sälja, hyra ut, tillgängliggöra, dekompilera, bakåtkompilera eller på annat sätt använda Tjänsten eller dess innehåll utöver vad som uttryckligen är tillåtet enligt dessa villkor eller tvingande lag.
              </Paragraph>
              <Paragraph>
                Om du laddar upp, skickar eller publicerar innehåll i Tjänsten, exempelvis text, meddelanden, preferenser, feedback eller annat material, ansvarar du för att du har rätt att använda och tillhandahålla sådant innehåll. Du ger CampusLyan en rätt att använda innehållet i den utsträckning som behövs för att tillhandahålla, visa, administrera, utveckla och förbättra Tjänsten.
              </Paragraph>
              <Paragraph>
                Feedback, idéer eller förslag som du lämnar till CampusLyan får användas av CampusLyan utan ersättning eller annan skyldighet gentemot dig, i den mån detta är tillåtet enligt lag.
              </Paragraph>
            </PolicySection>

            <PolicySection id="ansvar" title="12. Ansvar och övriga villkor">
              <Paragraph>
                CampusLyan strävar efter att Tjänsten ska vara säker, användbar och tillgänglig, men garanterar inte att Tjänsten alltid är fri från fel, brister, avbrott, förseningar eller säkerhetsproblem. Vi garanterar inte att informationen i Tjänsten alltid är korrekt, fullständig eller aktuell. Detta gäller även information om bostäder, bostadsköer, hyror, tillgänglighet, kövillkor, ansökningskrav, kontaktuppgifter och information som lämnas av bostadsföretag, fastighetsägare, samarbetspartners eller andra externa aktörer.
              </Paragraph>
              <Paragraph>
                Du ansvarar själv för att kontrollera information som är viktig för ditt bostadssökande innan du vidtar åtgärder, exempelvis anmäler intresse, ställer dig i kö, ansöker om bostad, accepterar erbjudande eller ingår hyresavtal.
              </Paragraph>
              <Paragraph>
                CampusLyan ansvarar inte för beslut, åtgärder, utebliven återkoppling, avslag, köplaceringar, erbjudanden, hyresavtal, villkor, avgifter, skador eller andra förhållanden som hänför sig till externa bostadsföretag, fastighetsägare, bostadsköer, samarbetspartners eller externa webbplatser.
              </Paragraph>
              <Paragraph>
                CampusLyan ansvarar inte för förlust eller skada som uppstår på grund av att Tjänsten är otillgänglig, att information är felaktig eller försenad, att externa system inte fungerar, att en intresseanmälan inte når fram, att en extern bostadskö ändrar sina regler eller att en bostadsaktör fattar ett visst beslut.
              </Paragraph>
              <Paragraph>
                Överföring av information via internet är aldrig helt säker. Du använder Tjänsten och överför information på egen risk, även om CampusLyan vidtar rimliga tekniska och organisatoriska säkerhetsåtgärder.
              </Paragraph>
              <Paragraph>
                Du får inte missbruka Tjänsten genom att medvetet introducera eller försöka introducera virus, trojaner, skadlig kod, överbelastningsattacker eller annat material som är tekniskt skadligt. Du får inte heller försöka få obehörig åtkomst till Tjänsten, servrar, databaser, system eller nätverk som är anslutna till Tjänsten.
              </Paragraph>
              <Paragraph>
                CampusLyan förbehåller sig rätten att polisanmäla eller på annat sätt vidta rättsliga åtgärder vid misstänkt brottslig, otillåten eller skadlig användning av Tjänsten.
              </Paragraph>
              <Paragraph>
                Ingenting i dessa villkor begränsar dina rättigheter som konsument enligt tvingande lag.
              </Paragraph>
            </PolicySection>

            <PolicySection id="andringar" title="13. Ändring av dessa användarvillkor">
              <Paragraph>
                CampusLyan förbehåller sig rätten att ändra dessa användarvillkor. Ändringar som inte uppenbarligen är till din fördel meddelas dig i skälig tid innan de träder i kraft, exempelvis via e-post, i Tjänsten eller genom information på vår webbplats.
              </Paragraph>
              <Paragraph>
                Om du inte vill acceptera ändringarna kan du avsluta ditt konto hos oss och sluta använda Tjänsten. Genom att fortsätta använda Tjänsten efter att ändringarna har trätt i kraft anses du ha accepterat de ändrade villkoren.
              </Paragraph>
            </PolicySection>

            <PolicySection id="tvist" title="14. Gällande lag och tvist">
              <Paragraph>
                Svensk lag är tillämplig på dessa användarvillkor. Eventuella tvister ska slutligen avgöras av svensk allmän domstol.
              </Paragraph>
              <Paragraph>
                Eventuella tvister med anledning av dessa användarvillkor eller din användning av Tjänsten ska i första hand lösas genom dialog mellan dig och CampusLyan. Om tvisten inte kan lösas genom dialog ska tvisten avgöras av svensk allmän domstol.
              </Paragraph>
              <Paragraph>
                Om du är konsument kan du även ha rätt att vända dig till Allmänna reklamationsnämnden, ARN, eller använda EU-kommissionens plattform för tvistlösning online, i den mån sådan möjlighet är tillämplig.
              </Paragraph>
              <Paragraph>
                Om du vill klaga på ett beslut som CampusLyan har fattat rörande ditt konto, din användning av Tjänsten eller innehåll i Tjänsten kan du kontakta oss via <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>. CampusLyan behandlar inkommande klagomål genom granskning av behörig personal.
              </Paragraph>
            </PolicySection>

          </article>
        </div>
      </section>
    </main>
  );
}

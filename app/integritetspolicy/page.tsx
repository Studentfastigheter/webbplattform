import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description: "Integritetspolicy för CampusLyan.",
  alternates: {
    canonical: "/integritetspolicy",
  },
};

const contactEmail = "viktor.fazlagic@campuslyan.se";

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

export default function IntegritetspolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="px-6 pb-20 pt-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 border-b border-border pb-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              CampusLyan
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Integritetspolicy
            </h1>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Senast uppdaterad: 7 maj 2026
            </p>
            <div className="mt-6 space-y-4">
              <Paragraph>
                Denna integritetspolicy beskriver hur CampusLyan behandlar personuppgifter när du besöker vår webbplats, skriver upp dig på vår waitlist, kontaktar oss eller på annat sätt använder våra digitala tjänster.
              </Paragraph>
              <Paragraph>
                CampusLyan är en plattform under utveckling som syftar till att förenkla bostadssökandet för studenter. I dagsläget samlar vi främst in e-postadresser från personer som vill få information när plattformen lanseras. När plattformen lanseras och fler funktioner blir tillgängliga kan denna integritetspolicy komma att uppdateras.
              </Paragraph>
            </div>
          </div>

          <div className="space-y-8">
            <PolicySection title="1. Personuppgiftsansvarig">
              <Paragraph>
                CampusLyan är ännu inte registrerat som aktiebolag och har därför inget organisationsnummer. Tills vidare är CampusLyan ansvarigt för behandlingen av personuppgifter enligt denna integritetspolicy.
              </Paragraph>
              <div className="rounded-xl border border-border bg-card p-4 text-base leading-8 text-muted-foreground">
                <p>CampusLyan</p>
                <p>Kontakt: {contactEmail}</p>
              </div>
              <Paragraph>
                När bolaget är registrerat kommer denna del att uppdateras med korrekt bolagsnamn, organisationsnummer och eventuell postadress.
              </Paragraph>
            </PolicySection>

            <PolicySection title="2. Vilka personuppgifter vi behandlar">
              <Paragraph>
                Vi behandlar endast de personuppgifter som är nödvändiga för de ändamål som anges i denna policy.
              </Paragraph>
              <Paragraph>När du skriver upp dig på vår waitlist behandlar vi:</Paragraph>
              <BulletList
                items={[
                  "e-postadress",
                  "tidpunkt för registrering",
                  "eventuell teknisk information kopplad till registreringen, exempelvis information som behövs för att administrera formuläret och säkerställa att registreringen fungerar korrekt",
                ]}
              />
              <Paragraph>När du kontaktar oss, exempelvis via e-post eller kontaktformulär, kan vi behandla:</Paragraph>
              <BulletList
                items={[
                  "namn, om du anger det",
                  "e-postadress",
                  "innehåll i ditt meddelande",
                  "annan information som du själv väljer att lämna till oss",
                ]}
              />
              <Paragraph>När du besöker vår webbplats kan vi även behandla viss teknisk information, exempelvis:</Paragraph>
              <BulletList
                items={[
                  "IP-adress",
                  "typ av enhet och webbläsare",
                  "tidpunkt för besök",
                  "information om hur webbplatsen används, om vi använder analysverktyg eller liknande teknik",
                ]}
              />
              <Paragraph>
                Vi behandlar inte fler personuppgifter än vad som är nödvändigt för respektive ändamål.
              </Paragraph>
            </PolicySection>

            <PolicySection title="3. Varför vi behandlar personuppgifter">
              <Paragraph>Vi behandlar personuppgifter för följande ändamål:</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Waitlist och lanseringsinformation</h3>
              <Paragraph>När du skriver upp dig på vår waitlist använder vi din e-postadress för att:</Paragraph>
              <BulletList
                items={[
                  "administrera waitlisten",
                  "skicka information om lanseringen av CampusLyan",
                  "skicka relevant information kopplad till plattformens lansering",
                ]}
              />
              <Paragraph>
                Vi använder inte din e-postadress för andra ändamål än de som anges här, om vi inte informerar dig om detta eller inhämtar ett nytt samtycke när det krävs.
              </Paragraph>
              <h3 className="text-base font-semibold text-foreground">Kommunikation</h3>
              <Paragraph>Om du kontaktar oss behandlar vi dina personuppgifter för att kunna:</Paragraph>
              <BulletList
                items={[
                  "besvara ditt meddelande",
                  "hantera frågor, synpunkter eller förfrågningar",
                  "följa upp tidigare kontakt med dig",
                ]}
              />
              <h3 className="text-base font-semibold text-foreground">Drift, säkerhet och utveckling av webbplatsen</h3>
              <Paragraph>Vi kan behandla teknisk information för att:</Paragraph>
              <BulletList
                items={[
                  "säkerställa att webbplatsen fungerar korrekt",
                  "skydda webbplatsen mot missbruk, spam och säkerhetsincidenter",
                  "felsöka tekniska problem",
                  "förbättra webbplatsens funktionalitet och användarupplevelse",
                ]}
              />
              <h3 className="text-base font-semibold text-foreground">Framtida användning av plattformen</h3>
              <Paragraph>
                När CampusLyan lanseras kan vi komma att behandla ytterligare personuppgifter, exempelvis i samband med användarkonton, bostadsbevakningar, kontakt med hyresvärdar, verifiering eller andra funktioner på plattformen. Om detta blir aktuellt kommer denna integritetspolicy att uppdateras innan sådan behandling påbörjas.
              </Paragraph>
            </PolicySection>

            <PolicySection title="4. Rättslig grund för behandlingen">
              <Paragraph>Vi behandlar personuppgifter med stöd av följande rättsliga grunder.</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Samtycke</h3>
              <Paragraph>
                När du skriver upp dig på vår waitlist behandlar vi din e-postadress med stöd av ditt samtycke. Du lämnar samtycke genom att själv ange din e-postadress och skicka in formuläret.
              </Paragraph>
              <Paragraph>
                Du kan när som helst återkalla ditt samtycke genom att kontakta oss eller genom att avregistrera dig från framtida utskick. Att du återkallar ditt samtycke påverkar inte lagligheten av behandling som skett innan samtycket återkallades.
              </Paragraph>
              <h3 className="text-base font-semibold text-foreground">Berättigat intresse</h3>
              <Paragraph>
                Vi kan behandla vissa personuppgifter med stöd av berättigat intresse, exempelvis när vi besvarar meddelanden, hanterar teknisk drift, skyddar webbplatsen mot missbruk eller förbättrar våra tjänster.
              </Paragraph>
              <Paragraph>
                Vårt berättigade intresse är då att kunna driva, skydda, utveckla och kommunicera kring vår verksamhet på ett ändamålsenligt sätt.
              </Paragraph>
              <h3 className="text-base font-semibold text-foreground">Rättslig förpliktelse</h3>
              <Paragraph>
                I vissa fall kan vi behöva behandla personuppgifter för att uppfylla rättsliga skyldigheter, exempelvis enligt bokföringsregler eller annan tillämplig lagstiftning. Detta är främst aktuellt om du i framtiden blir kund, leverantör eller avtalspart till oss.
              </Paragraph>
            </PolicySection>

            <PolicySection title="5. E-postutskick och marknadsföring">
              <Paragraph>
                Vi skickar i dagsläget inga e-postutskick. Om du skriver upp dig på vår waitlist sparar vi din e-postadress för att kunna kontakta dig med information om CampusLyans lansering när sådana utskick blir aktuella.
              </Paragraph>
              <Paragraph>
                Du kan när som helst begära att bli borttagen från waitlisten genom att kontakta oss på {contactEmail}.
              </Paragraph>
              <Paragraph>Vi säljer inte din e-postadress till tredje part.</Paragraph>
              <Paragraph>
                För direktmarknadsföring via e-post till konsumenter krävs som huvudregel samtycke, vilket även framgår av IMY:s information om direktmarknadsföring.
              </Paragraph>
            </PolicySection>

            <PolicySection title="6. Hur länge vi sparar personuppgifter">
              <Paragraph>
                Vi sparar inte personuppgifter längre än vad som är nödvändigt för de ändamål som de samlades in för.
              </Paragraph>
              <Paragraph>För waitlisten gäller följande:</Paragraph>
              <BulletList
                items={[
                  "Din e-postadress sparas så länge waitlisten är aktiv och det finns ett relevant syfte att informera dig om lanseringen.",
                  "Om du avregistrerar dig eller återkallar ditt samtycke raderar vi din e-postadress från waitlisten.",
                  "Efter att lanseringsutskick har skickats kan vi komma att radera uppgifterna, om det inte finns ett nytt tydligt syfte och rättslig grund för fortsatt behandling.",
                ]}
              />
              <Paragraph>
                För meddelanden och kontaktförfrågningar sparar vi uppgifter så länge det behövs för att hantera ärendet och eventuell uppföljning.
              </Paragraph>
              <Paragraph>
                Teknisk information och loggar sparas endast så länge det är nödvändigt för drift, säkerhet, felsökning och statistik.
              </Paragraph>
            </PolicySection>

            <PolicySection title="7. Vilka som kan ta del av personuppgifter">
              <Paragraph>
                Personuppgifter kan behandlas av personer inom CampusLyan som behöver tillgång till uppgifterna för att utföra sina arbetsuppgifter.
              </Paragraph>
              <Paragraph>Vi kan även använda externa leverantörer för exempelvis:</Paragraph>
              <BulletList
                items={[
                  "webbhosting",
                  "databas och backend",
                  "e-postutskick",
                  "analysverktyg",
                  "formulärhantering",
                  "säkerhet och teknisk drift",
                ]}
              />
              <Paragraph>
                Sådana leverantörer får endast behandla personuppgifter enligt våra instruktioner och för de ändamål som anges i denna policy.
              </Paragraph>
              <Paragraph>Exempel på leverantörer som kan vara aktuella är:</Paragraph>
              <BulletList
                items={[
                  "Firebase för databas och teknisk infrastruktur",
                  "Vercel för hosting",
                  "Vercel Analytics för webbstatistik",
                ]}
              />
            </PolicySection>

            <PolicySection title="8. Överföring av personuppgifter utanför EU/EES">
              <Paragraph>Vi strävar efter att behandla personuppgifter inom EU/EES.</Paragraph>
              <Paragraph>
                Om vi använder leverantörer som behandlar personuppgifter utanför EU/EES säkerställer vi att sådan överföring sker i enlighet med tillämplig dataskyddslagstiftning, exempelvis genom EU-kommissionens standardavtalsklausuler eller annat giltigt överföringsstöd.
              </Paragraph>
            </PolicySection>

            <PolicySection title="9. Säkerhet">
              <Paragraph>
                Vi vidtar tekniska och organisatoriska säkerhetsåtgärder för att skydda personuppgifter mot obehörig åtkomst, förlust, förstöring eller otillåten behandling.
              </Paragraph>
              <Paragraph>Exempel på sådana åtgärder kan vara:</Paragraph>
              <BulletList
                items={[
                  "begränsad åtkomst till personuppgifter",
                  "behörighetsstyrning",
                  "krypterad kommunikation där det är relevant",
                  "säker hantering av databaser och system",
                  "löpande kontroll av tekniska lösningar",
                ]}
              />
              <Paragraph>
                Vi arbetar för att endast personer som behöver åtkomst till personuppgifter ska ha sådan åtkomst.
              </Paragraph>
            </PolicySection>

            <PolicySection title="10. Cookies och liknande teknik">
              <Paragraph>
                Vår webbplats kan använda cookies och liknande teknik för att webbplatsen ska fungera korrekt, för att förbättra användarupplevelsen och för att analysera användningen av webbplatsen.
              </Paragraph>
              <Paragraph>Cookies kan delas in i följande kategorier:</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Nödvändiga cookies</h3>
              <Paragraph>
                Dessa cookies krävs för att webbplatsen ska fungera och kan normalt inte stängas av i våra system.
              </Paragraph>
              <h3 className="text-base font-semibold text-foreground">Analyscookies</h3>
              <Paragraph>
                Dessa cookies hjälper oss att förstå hur besökare använder webbplatsen, exempelvis vilka sidor som besöks och hur användare interagerar med innehållet.
              </Paragraph>
              <h3 className="text-base font-semibold text-foreground">Marknadsföringscookies</h3>
              <Paragraph>
                Dessa cookies kan användas för att visa relevant innehåll eller marknadsföring, om sådan funktionalitet används.
              </Paragraph>
              <Paragraph>
                Om vi använder cookies som inte är nödvändiga för webbplatsens funktion kommer vi att informera om detta och inhämta samtycke där det krävs. PTS ansvarar för tillsyn av reglerna om cookies i Sverige.
              </Paragraph>
              <Paragraph>
                Du kan själv hantera eller radera cookies i din webbläsare. Om du blockerar cookies kan vissa delar av webbplatsen fungera sämre.
              </Paragraph>
            </PolicySection>

            <PolicySection title="11. Dina rättigheter">
              <Paragraph>
                Du har rättigheter enligt dataskyddslagstiftningen. IMY beskriver bland annat att registrerade har rätt till information, tillgång, rättelse, radering och andra rättigheter kopplade till personuppgiftsbehandling.
              </Paragraph>
              <Paragraph>Du har rätt att:</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Begära tillgång</h3>
              <Paragraph>Du kan begära information om vilka personuppgifter vi behandlar om dig.</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Begära rättelse</h3>
              <Paragraph>Du kan begära att felaktiga eller ofullständiga personuppgifter rättas.</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Begära radering</h3>
              <Paragraph>
                Du kan begära att vi raderar dina personuppgifter, exempelvis om uppgifterna inte längre behövs eller om du återkallar ditt samtycke. IMY anger att radering bland annat kan bli aktuellt när uppgifterna inte längre behövs eller när behandling som grundas på samtycke återkallas.
              </Paragraph>
              <h3 className="text-base font-semibold text-foreground">Återkalla samtycke</h3>
              <Paragraph>Om behandlingen grundas på samtycke kan du när som helst återkalla samtycket.</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Begära begränsning</h3>
              <Paragraph>Du kan i vissa fall begära att behandlingen av dina personuppgifter begränsas.</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Invända mot behandling</h3>
              <Paragraph>Du kan i vissa fall invända mot behandling som grundas på berättigat intresse.</Paragraph>
              <h3 className="text-base font-semibold text-foreground">Begära dataportabilitet</h3>
              <Paragraph>
                Om behandlingen grundas på samtycke eller avtal och sker automatiserat kan du i vissa fall begära att få ut dina personuppgifter i ett strukturerat, allmänt använt och maskinläsbart format.
              </Paragraph>
              <Paragraph>För att utöva dina rättigheter kan du kontakta oss på:</Paragraph>
              <div className="rounded-xl border border-border bg-card p-4 text-base leading-8 text-muted-foreground">
                {contactEmail}
              </div>
              <Paragraph>Vi kan behöva be dig att bekräfta din identitet innan vi hanterar din begäran.</Paragraph>
            </PolicySection>

            <PolicySection title="12. Ändringar i denna integritetspolicy">
              <Paragraph>
                Vi kan komma att uppdatera denna integritetspolicy, exempelvis om vi lanserar nya funktioner, ändrar hur vi behandlar personuppgifter eller om lagstiftningen förändras.
              </Paragraph>
              <Paragraph>
                Den senaste versionen av integritetspolicyn finns alltid tillgänglig på vår webbplats.
              </Paragraph>
            </PolicySection>
          </div>
        </div>
      </section>
    </main>
  );
}

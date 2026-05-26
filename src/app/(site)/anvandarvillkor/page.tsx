export const dynamic = "force-static";
import Link from "next/link";

export default function TermsPage() {
  const lastUpdated = "2025-12-26";

  return (
    // Ljusgrå bakgrund för hela sidan för att skapa kontrast mot text-kortet
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="mx-auto max-w-4xl">
        {/* Tillbaka-länk */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            ← Tillbaka till startsidan
          </Link>
        </div>

        {/* Huvudkortet */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header-sektion med lätt bakgrundsfärg */}
          <header className="bg-slate-50 px-8 py-10 border-b border-slate-100">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Användarvillkor
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Gäller från: {lastUpdated}
                </span>
                <span className="text-sm text-gray-500">
                  Version 1.0
                </span>
              </div>
            </div>
          </header>

          {/* Innehålls-sektion */}
          <div className="px-8 py-10">
            <div className="max-w-3xl mx-auto">
              
              {/* PROSE-KLASSEN: 
                'prose' sköter all styling av p, h2, ul, li automatiskt. 
                'prose-slate' ger en bra gråskala.
                'prose-a:text-blue-600' gör alla länkar blå.
              */}
              <article className="prose prose-slate prose-lg max-w-none hover:prose-a:text-blue-500 prose-headings:font-bold prose-p:text-gray-600">
                
                {/* --- HÄR KLISTRAR DU IN DIN TEXT (Börja här) --- */}

                <p className="lead">
                  Här är en sammanfattning av vad som gäller när du använder vår tjänst. 
                  Det är viktigt att du läser igenom detta för att förstå dina rättigheter och skyldigheter.
                </p>

                <h2>1. Allmänt</h2>
                <p>
                  Dessa villkor gäller när du använder våra tjänster ("Tjänsten"). Genom att använda Tjänsten godkänner du dessa villkor i sin helhet.
                  Om du inte godkänner villkoren får du inte använda Tjänsten.
                </p>
                <p>
                  Vi förbehåller oss rätten att ändra dessa villkor när som helst. 
                  Väsentliga ändringar kommer att meddelas via e-post eller direkt i tjänsten, men mindre justeringar träder i kraft så snart de publiceras på denna sida.
                </p>

                <h2>2. Personuppgifter och Integritet</h2>
                <p>
                  Vi värnar om din personliga integritet. All behandling av personuppgifter sker i enlighet med gällande dataskyddslagstiftning (GDPR). 
                  Information om hur vi behandlar dina personuppgifter finns i vår <Link href="/integritet">Integritetspolicy</Link>.
                </p>

                <h2>3. Användarens ansvar</h2>
                <p>Som användare förbinder du dig att:</p>
                <ul>
                  <li>Inte använda tjänsten för olagliga eller skadliga ändamål.</li>
                  <li>Ansvara för att dina inloggningsuppgifter (användarnamn och lösenord) hålls hemliga och inte delas med obehöriga.</li>
                  <li>Inte kopiera, distribuera eller sälja innehåll från tjänsten utan vårt skriftliga tillstånd.</li>
                  <li>Uppträda vårdat och respektfullt mot andra användare och vår supportpersonal.</li>
                </ul>

                <h2>4. Ansvarsbegränsning</h2>
                <p>
                  Tjänsten tillhandahålls i "befintligt skick". Vi garanterar inte att tjänsten alltid kommer att vara tillgänglig eller felfri. 
                  Vi ansvarar inte för direkta eller indirekta skador som uppstår vid användning av, eller oförmåga att använda, tjänsten.
                </p>

                <h2>5. Kontakt</h2>
                <p>
                  Har du frågor kring våra villkor eller hur tjänsten fungerar? Tveka inte att kontakta oss.
                </p>
                <p>
                  <strong>E-post:</strong> <a href="mailto:info@example.com">info@example.com</a><br />
                  <strong>Telefon:</strong> 08-123 456 78
                </p>

                {/* --- SLUT PÅ DIN TEXT --- */}

              </article>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
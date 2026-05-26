export const dynamic = "force-static";
import Link from "next/link";

export default function PrivacyPage() {
  const lastUpdated = "2025-12-26";

  return (
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

        {/* Kortet */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <header className="bg-slate-50 px-8 py-10 border-b border-slate-100">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                Personuppgiftspolicy
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Uppdaterad: {lastUpdated}
                </span>
              </div>
            </div>
          </header>

          <div className="px-8 py-10">
            <div className="max-w-3xl mx-auto">
              <article className="prose prose-slate prose-lg max-w-none hover:prose-a:text-blue-500 prose-headings:font-bold prose-p:text-gray-600">
                
                <p className="lead">
                  Vi värnar om din integritet. Denna policy beskriver hur vi samlar in, använder och skyddar dina personuppgifter när du använder vår tjänst.
                </p>

                <h2>1. Personuppgiftsansvarig</h2>
                <p>
                  Ansvarig för behandlingen av personuppgifter är:
                </p>
                <p>
                  <strong>[Ditt Företagsnamn]</strong><br />
                  Org.nr: [Ditt Org.nr]<br />
                  E-post: [Din e-post]
                </p>

                <h2>2. Vilka uppgifter samlar vi in?</h2>
                <p>Vi kan komma att samla in och behandla följande information om dig:</p>
                <ul>
                  <li><strong>Kontaktuppgifter:</strong> t.ex. namn, e-postadress, telefonnummer och adress.</li>
                  <li><strong>Användardata:</strong> t.ex. IP-adress, enhetstyp, webbläsarversion och hur du interagerar med sidan.</li>
                  <li><strong>Ärendeinformation:</strong> Information du lämnar till oss vid supportärenden eller kontakt via e-post.</li>
                </ul>

                <h2>3. Hur använder vi uppgifterna?</h2>
                <p>
                  Vi behandlar dina uppgifter för följande ändamål:
                </p>
                <ul>
                  <li>För att kunna leverera och administrera vår tjänst.</li>
                  <li>För att fullgöra avtal med dig som kund.</li>
                  <li>För att ge kundsupport och hantera förfrågningar.</li>
                  <li>För att förbättra våra tjänster genom analys (anonymiserad data).</li>
                  <li>Om du samtyckt: För att skicka nyhetsbrev och relevant marknadsföring.</li>
                </ul>

                <h2>4. Lagringstid</h2>
                <p>
                  Vi sparar dina uppgifter så länge det är nödvändigt för att uppfylla ändamålet med behandlingen eller så länge lagen kräver det (t.ex. bokföringslagen). 
                  När uppgifterna inte längre behövs raderas eller anonymiseras de på ett säkert sätt.
                </p>

                <h2>5. Dina rättigheter</h2>
                <p>
                  Enligt dataskyddsförordningen (GDPR) har du flera rättigheter rörande dina personuppgifter:
                </p>
                <ul>
                  <li><strong>Rätt till tillgång:</strong> Du har rätt att begära utdrag av vilka uppgifter vi har sparade om dig.</li>
                  <li><strong>Rätt till rättelse:</strong> Du har rätt att korrigera felaktig eller ofullständig information.</li>
                  <li><strong>Rätt till radering:</strong> Under vissa omständigheter har du rätt att begära att bli raderad ("rätten att bli bortglömd").</li>
                </ul>
                <p>
                  Kontakta oss via e-postadressen ovan om du vill utöva dessa rättigheter.
                </p>

              </article>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
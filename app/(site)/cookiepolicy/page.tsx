export const dynamic = "force-static";
import Link from "next/link";

export default function CookiePage() {
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
                Cookiepolicy
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
                  Vi använder cookies för att förbättra din upplevelse på vår webbplats. 
                  Här förklarar vi vad cookies är och hur vi använder dem.
                </p>

                <h2>Vad är en cookie?</h2>
                <p>
                  En cookie är en liten textfil som lagras på din dator eller mobila enhet när du besöker en webbplats. 
                  Den gör att webbplatsen kan komma ihåg dina handlingar och inställningar under en viss tid, så att du inte behöver göra om dessa val varje gång du besöker webbplatsen eller bläddrar mellan olika sidor.
                </p>

                <h2>Vilka typer av cookies använder vi?</h2>
                <ul>
                  <li>
                    <strong>Nödvändiga cookies:</strong> Dessa krävs för att webbplatsens grundläggande funktioner ska fungera (t.ex. inloggning eller varukorg).
                  </li>
                  <li>
                    <strong>Analyscookies:</strong> Vi använder tjänster (t.ex. Google Analytics) för att förstå hur besökare interagerar med webbplatsen genom att samla in och rapportera information anonymt.
                  </li>
                  <li>
                    <strong>Funktionella cookies:</strong> Dessa kommer ihåg dina val (t.ex. språkinställningar eller användarnamn) för att ge en mer personlig upplevelse.
                  </li>
                </ul>

                <h2>Hantera cookies</h2>
                <p>
                  Du kan kontrollera och/eller radera cookies som du vill via inställningarna i din webbläsare. 
                  Observera att om du inaktiverar cookies kan vissa funktioner på webbplatsen sluta fungera eller bete sig oväntat.
                </p>

              </article>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
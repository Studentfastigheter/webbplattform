const faqs = [
  {
    q: "Är CampusLyan gratis för studenter?",
    a: "Ja. Att skapa konto, hitta bostäder, följa annonser, ställa sig i köer och skicka intresse är helt kostnadsfritt.",
  },
  {
    q: "Behöver jag Bank-ID?",
    a: "Ja. Du loggar in med Bank-ID för att vi ska kunna verifiera att du är student och matcha dig mot relevanta bostäder och köer.",
  },
  {
    q: "Hur fungerar bostadsköerna?",
    a: "CampusLyan samlar köer från olika aktörer. Du kan ställa dig i kö direkt i appen och se villkor, krav och din status för varje kö.",
  },
  {
    q: "Kan jag hyra ut min lägenhet via CampusLyan?",
    a: "Ja. Studenter kan hyra ut tryggt när de ska åka på utbyte, sommarjobba eller vara borta längre perioder. Avtal och kontakt sker i plattformen.",
  },
  {
    q: "Hur fungerar trygg uthyrning för privatpersoner?",
    a: "Du får endast kontakt med verifierade studenter. Vi guidar dig genom hela processen – från första meddelande till signerat avtal.",
  },
  {
    q: "Varför visas inte adressen på annonser?",
    a: "Exakta adresser visas när du är inloggad. Detta ökar tryggheten för både uthyrare och studenter.",
  },
  {
    q: "Kan företag lägga upp sina bostäder?",
    a: "Ja. Bostadsbolag kan publicera via portal eller API. Vi kan även hantera bostadskön om så önskas. Ta kontakt med oss, så hjälper vi er att komma igång.",
  },
  {
    q: "Visar ni studentrabatter och spartips?",
    a: "Ja. Vi samlar relevanta erbjudanden, ekonomi-guider och tips för vardagsekonomi som hjälper dig som student.",
  },
];

export default function Faq() {
  return (
    <section className="section text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* HÄR: Uppdaterad container för enhetliga marginaler */}
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="h2 mb-6 text-slate-900 dark:text-white">
          Vanliga frågor
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((f, i) => (
            <article
              key={i}
              className="rounded-2xl border border-black/5 p-5 shadow-soft dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="mb-2 font-semibold text-slate-900 dark:text-white">
                {f.q}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {f.a}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
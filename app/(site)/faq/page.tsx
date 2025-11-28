export const dynamic = "force-static";

const faqs = [
  { q: "Är CampusLyan gratis?", a: "Ja, plattformen är helt gratis för studenter. Inga dolda avgifter." },
  { q: "Hur väljer jag skola?", a: "Logga in och välj skola på startsidan. Valet sparas i din profil." },
  { q: "Hur fungerar köer?", a: "Du kan gå med i köer för företag nära din skola eller alla företag på plattformen." },
  { q: "Hur skickar jag intresse?", a: "Öppna en annons när du är inloggad och klicka på Intresseanmälan." },
  { q: "Varifrån kommer annonserna?", a: "Från samarbetande studentbostadsföretag och via öppna källor med verifiering." },
  { q: "Vilka städer täcker ni?", a: "Vi fokuserar på större studentstäder; utbudet växer löpande." },
];

export default function FaqPage() {
  return (
    <main className="container-page">
      <section className="section">
        <h1 className="h1 mb-6">Vanliga frågor</h1>
        <div className="grid gap-4">
          {faqs.map((f, i) => (
            <details key={i} className="card">
              <summary className="font-semibold cursor-pointer">{f.q}</summary>
              <p className="text-sm text-muted mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}


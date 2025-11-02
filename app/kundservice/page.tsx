export const dynamic = "force-static";

export default function KundservicePage() {
  return (
    <main className="container-page">
      <section className="section">
        <h1 className="h1 mb-4">Kundservice & kontakt</h1>
        <p className="text-muted mb-6">Behöver du hjälp? Vi finns här för dig.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="card">
            <h2 className="h2 mb-2">Kontakta oss</h2>
            <ul className="space-y-1">
              <li>E‑post: <a className="text-brand underline" href="mailto:support@campuslyan.se">support@campuslyan.se</a></li>
              <li>LinkedIn: <a className="text-brand underline" href="https://www.linkedin.com/company/campuslyan" target="_blank" rel="noreferrer">CampusLyan</a></li>
              <li>Instagram: <a className="text-brand underline" href="https://www.instagram.com/campuslyan" target="_blank" rel="noreferrer">@campuslyan</a></li>
            </ul>
          </article>

          <article className="card">
            <h2 className="h2 mb-2">Vanliga frågor</h2>
            <ul className="list-disc ml-5 space-y-2 text-sm">
              <li>Hur väljer jag skola? – Logga in och välj via sektionen “Välj skola” på startsidan.</li>
              <li>Hur ställer jag mig i kö? – Gå in på annonsen eller använd “Gå med i alla köer nära skolan”.</li>
              <li>Varför ser jag inte adressen? – Detaljer visas när du är inloggad.</li>
            </ul>
          </article>
        </div>

        <article className="card mt-6">
          <h2 className="h2 mb-2">Öppettider</h2>
          <p className="text-sm">Mån–Fre 09:00–17:00 (helgdagar stängt)</p>
        </article>
      </section>
    </main>
  );
}


export const dynamic = "force-static";

export default function OmPage() {
  return (
    <main className="container-page">
      <section className="section">
        <h1 className="h1 mb-4">Om CampusLyan</h1>
        <p className="text-muted mb-6">
          CampusLyan hjälper studenter att hitta sin nästa bostad – snabbare och tryggare. Vi samlar relevanta
          annonser, visar avstånd till skola och aktiviteter i närheten, och förenklar köhanteringen.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="card">
            <h2 className="h2 mb-2">Vårt uppdrag</h2>
            <p>
              Göra studentboendet enklare: transparent information, smart karta och filtrering, och verktyg för köer
              och intresseanmälan – allt i ett.
            </p>
          </article>
          <article className="card">
            <h2 className="h2 mb-2">Trygghet & integritet</h2>
            <p>
              Vi tar datasäkerhet på allvar. Läs mer om hur vi hanterar personuppgifter under <a className="text-brand underline" href="/privacy">Integritet</a>.
            </p>
          </article>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <article className="card">
            <h2 className="h2 mb-2">Team & kontakt</h2>
            <p>
              Har du frågor eller vill samarbeta? Hör av dig via <a className="text-brand underline" href="/kundservice">Kundservice & kontakt</a>.
            </p>
          </article>
          <article className="card">
            <h2 className="h2 mb-2">Press & partners</h2>
            <p>
              För pressmaterial, logotyper och partnerskap – kontakta oss så hjälper vi dig.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}


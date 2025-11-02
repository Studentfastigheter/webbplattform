import Link from "next/link";

const faqs = [
  {
    q: "Är CampusLyan gratis?",
    a: "Ja. Plattformen är helt kostnadsfri för studenter att använda.",
  },
  {
    q: "Hur funkar köer och intresse?",
    a: "När du är inloggad kan du ställa dig i köer för företag och skicka intresseanmälan direkt från annonsen.",
  },
  {
    q: "Hur väljer jag skola?",
    a: "Välj din skola på startsidan (inloggad) så visas avstånd i km till varje annons och relevanta köer.",
  },
  {
    q: "Varför ser jag inte adressen?",
    a: "Detaljerad information som adress visas när du är inloggad.",
  },
];

export default function Faq() {
  return (
    <section className="section">
      <div className="container-page">
        <h2 className="h2 mb-6">Vanliga frågor</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((f, i) => (
            <article key={i} className="card shadow-soft">
              <div className="font-semibold mb-2">{f.q}</div>
              <p className="text-sm text-muted">{f.a}</p>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <Link className="btn btn-outline" href="/faq">Läs fler frågor</Link>
        </div>
      </div>
    </section>
  );
}


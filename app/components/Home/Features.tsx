export default function Features() {
  const items = [
    { title: "Smart karta", text: "Se alla annonser och aktiviteter i närheten. Zooma in för miniatyrer.", icon: "🗺️" },
    { title: "Köer & intresse", text: "Ställ dig i köer och skicka intresseanmälan – direkt från annonsen.", icon: "✅" },
    { title: "Avstånd till skola", text: "Välj skola och få avstånd i km till varje bostad.", icon: "🎓" },
    { title: "Snabb filtrering", text: "Filtrera på stad, pris, rum och mer.", icon: "⚡" },
  ];
  return (
    <section className="section">
      <div className="container-page">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f, i) => (
            <article key={i} className="card shadow-soft">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold mb-1">{f.title}</div>
              <p className="text-sm text-muted">{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


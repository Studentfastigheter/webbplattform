"use client";

import { useEffect, useState } from "react";

type Company = { id: number; name: string };
type Union = { name: string; city?: string; url?: string };

export default function PartnersPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companies', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then((rows: Company[]) => setCompanies(rows || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  const unions: Union[] = [
    { name: 'Chalmers Studentkår', city: 'Göteborg', url: 'https://chalmersstudentkar.se' },
    { name: 'Göteborgs Universitets studentkårer (GUS)', city: 'Göteborg', url: 'https://gus.gu.se' },
    { name: 'Teknologkåren vid LTH', city: 'Lund', url: 'https://tlth.se' },
    { name: 'THS – Tekniska Högskolans Studentkår', city: 'Stockholm', url: 'https://ths.kth.se' },
  ];

  return (
    <main className="container-page">
      <section className="section">
        <h1 className="h1 mb-4">Våra samarbetspartners</h1>
        <p className="text-muted mb-6">
          Här lyfter vi våra partners – studentbostadsföretag som publicerar sina annonser hos oss och studentkårer som
          hjälper sina studenter att hitta boende via CampusLyan.
        </p>

        <h2 className="h2 mb-3">Studentbostadsföretag</h2>
        {loading && <div className="card">Laddar…</div>}
        {!loading && companies.length === 0 && (
          <div className="card">Inga företag listade ännu.</div>
        )}
        {!loading && companies.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map(c => (
              <article key={c.id} className="card shadow-soft">
                <div className="font-semibold mb-1">{c.name}</div>
                <div className="text-sm text-muted">Publicerar annonser via CampusLyan</div>
              </article>
            ))}
          </div>
        )}

        <h2 className="h2 mt-10 mb-3">Studentkårer</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unions.map((u, i) => (
            <article key={i} className="card shadow-soft">
              <div className="font-semibold mb-1">{u.name}</div>
              <div className="text-sm text-muted">{u.city || ''}</div>
              {u.url && (
                <a className="text-brand underline text-sm mt-2 inline-block" href={u.url} target="_blank" rel="noreferrer">Besök webbplats</a>
              )}
            </article>
          ))}
        </div>

        <article className="card mt-10">
          <h3 className="h2 mb-2">Vill ni samarbeta med oss?</h3>
          <p className="text-sm text-muted">Kontakta oss på <a className="text-brand underline" href="mailto:partner@campuslyan.se">partner@campuslyan.se</a>.</p>
        </article>
      </section>
    </main>
  );
}


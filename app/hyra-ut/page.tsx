"use client";

import Link from "next/link";

export default function HyraUtPage() {
  return (
    <main className="container-page">
      <section className="section space-y-4">
        <h1 className="h1">Hyra ut ett rum</h1>
        <p className="text-muted max-w-2xl">
          Har du ett extra rum eller en del av din bostad du vill hyra ut till en student? Publicera en annons på CampusLyan – det är enkelt och gratis att komma igång.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="card">
            <h2 className="h3 mb-1">Steg för steg</h2>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Skapa konto och verifiera din e-post.</li>
              <li>Beskriv rummet – läge, hyra, inflyttning, regler.</li>
              <li>Ladda upp bilder och publicera annonsen.</li>
              <li>Ta emot och svara på intresseanmälningar.</li>
            </ul>
          </article>
          <article className="card">
            <h2 className="h3 mb-1">Tips</h2>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Var tydlig med vad som ingår (möbler, internet, el).</li>
              <li>Ställ krav på rökfritt och hänsyn i hemmet.</li>
              <li>Sätt en rimlig hyra och skriv avtal.</li>
            </ul>
          </article>
        </div>

        <div className="flex gap-3">
          <Link href="/register" className="btn btn-primary">Skapa konto</Link>
          <Link href="/kundservice" className="btn btn-outline">Frågor? Kontakta oss</Link>
        </div>
      </section>
    </main>
  );
}


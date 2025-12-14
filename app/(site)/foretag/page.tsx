"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForForetagPage() {
  return (
    <main className="container-page">
      <section className="section space-y-4">
        <h1 className="h1">För företag</h1>
        <p className="text-muted max-w-2xl">
          Publicera era lediga studentbostäder direkt på CampusLyan. Nå studenter där de redan letar – med smidig publicering, intressehantering och annonser som ser bra ut överallt.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="card">
            <h2 className="h3 mb-1">Så funkar det</h2>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Skapa företagskonto och verifiera domän.</li>
              <li>Publicera annonser manuellt eller via import.</li>
              <li>Ta emot intresseanmälningar och följ upp.</li>
              <li>Spåra visningar och konverteringar.</li>
            </ul>
          </article>
          <article className="card">
            <h2 className="h3 mb-1">Vad ingår</h2>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Annonsmallar med bilder och kartstöd.</li>
              <li>Automatisk synlighet nära högskolor.</li>
              <li>API & import från befintliga system.</li>
              <li>Support via <Link className="text-brand underline" href="/kundservice">kundservice</Link>.</li>
            </ul>
          </article>
        </div>

        <div className="flex gap-3">
          <Button as={Link} href="/register">
            Skapa företagskonto
          </Button>
          <Button as={Link} href="/kundservice" variant="outline">
            Kontakta oss
          </Button>
        </div>
      </section>
    </main>
  );
}

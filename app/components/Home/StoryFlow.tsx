"use client";

import Link from "next/link";
import Reveal from "@/lib/reveal";
import { Button } from "@heroui/button";

export default function StoryFlow() {
  return (
    <>
      {/* Del 1: Vad är CampusLyan? */}
      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-2 items-center">
          <Reveal variant="left">
            <div>
              <h2 className="h2 mb-2">Hitta din studentlya – enkelt</h2>
              <p className="text-muted">
                CampusLyan samlar studentbostäder från flera aktörer på ett ställe. Du ser kartvy, kan ställa dig i köer och
                skicka intresse – allt med ett konto.
              </p>
              <div className="mt-4 flex gap-3">
                <Button as={Link} href="/listings" color="success">
                  Utforska annonser
                </Button>
                <Button as={Link} href="/register" variant="bordered" color="success">
                  Skapa konto
                </Button>
              </div>
            </div>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <div className="card">
              <ul className="list-disc ml-5 text-sm text-muted space-y-1">
                <li>Kartvy nära din skola</li>
                <li>Relevanta köer med ett klick</li>
                <li>Smidiga intresseanmälningar</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Del 2: Så funkar det */}
      <section className="section">
        <div className="container-page">
          <h2 className="h2 mb-6">Så funkar det</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { n: 1, t: "Utforska", d: "Filtrera och hitta rätt bostad." },
              { n: 2, t: "Skapa konto", d: "Spara och följ bostäder." },
              { n: 3, t: "Kö & intresse", d: "Ställ dig i köer och skicka intresse." },
              { n: 4, t: "Flytta in", d: "Följ upp svar och boka visning." },
            ].map((s, i) => (
              <Reveal key={s.n} variant="up" delay={i * 100}>
                <article className="card shadow-soft">
                  <div className="text-2xl font-semibold">{s.n}.</div>
                  <div className="font-semibold">{s.t}</div>
                  <p className="text-sm text-muted">{s.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Del 3: Vårt utbud */}
      <section className="section">
        <div className="container-page grid gap-6 lg:grid-cols-2 items-start">
          <Reveal variant="left">
            <article className="card shadow-soft">
              <h3 className="h3 mb-1">Våra köer</h3>
              <p className="text-sm text-muted mb-2">Se alla bostadsköer vi stödjer och gå med när du skapat konto.</p>
              <Button as={Link} href="/alla-koer" variant="bordered" color="success">
                Alla köer
              </Button>
            </article>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <article className="card shadow-soft">
              <h3 className="h3 mb-1">Annonser</h3>
              <p className="text-sm text-muted mb-2">Bläddra bland aktuella studentbostäder från flera aktörer.</p>
              <Button as={Link} href="/listings" color="success">
                Se annonser
              </Button>
            </article>
          </Reveal>
        </div>
      </section>
    </>
  );
}

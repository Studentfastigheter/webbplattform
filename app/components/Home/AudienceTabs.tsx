"use client";

import { useState } from "react";
import Link from "next/link";

type TabKey = "studenter" | "foretag" | "hyra";

export default function AudienceTabs() {
  const [tab, setTab] = useState<TabKey>("studenter");

  return (
    <section className="section">
      <div className="container-page">
        <div role="tablist" aria-label="Målgrupper" className="flex gap-2 mb-4">
          <button
            role="tab"
            aria-selected={tab === "studenter"}
            className={`btn ${tab === "studenter" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTab("studenter")}
          >
            Studenter
          </button>
          <button
            role="tab"
            aria-selected={tab === "foretag"}
            className={`btn ${tab === "foretag" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTab("foretag")}
          >
            För företag
          </button>
          <button
            role="tab"
            aria-selected={tab === "hyra"}
            className={`btn ${tab === "hyra" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTab("hyra")}
          >
            Hyra ut
          </button>
        </div>

        {tab === "studenter" && (
          <article className="card shadow-soft">
            <h3 className="h3 mb-2">För dig som letar bostad</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm text-muted">
              <li>Filtrera bland annonser och se kartvy nära din skola.</li>
              <li>Ställ dig i köer och skicka intresse med ett klick.</li>
              <li>Spara tid — allt samlat på ett ställe, gratis.</li>
            </ul>
            <div className="mt-3 flex gap-3">
              <Link href="/listings" className="btn btn-primary">Se annonser</Link>
              <Link href="/alla-koer" className="btn btn-outline">Alla köer</Link>
            </div>
          </article>
        )}

        {tab === "foretag" && (
          <article className="card shadow-soft">
            <h3 className="h3 mb-2">För bostadsbolag</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm text-muted">
              <li>Publicera studentbostäder manuellt eller via import/API.</li>
              <li>Nå studenter där de redan letar bostad.</li>
              <li>Smidig intressehantering och varumärkesvänliga mallar.</li>
            </ul>
            <div className="mt-3 flex gap-3">
              <Link href="/for-foretag" className="btn btn-primary">För företag</Link>
              <Link href="/kundservice" className="btn btn-outline">Kontakta oss</Link>
            </div>
          </article>
        )}

        {tab === "hyra" && (
          <article className="card shadow-soft">
            <h3 className="h3 mb-2">Hyra ut rum</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm text-muted">
              <li>Publicera annons på några minuter.</li>
              <li>Trygga tips om hyresavtal och regler.</li>
              <li>Kostnadsfritt att komma igång.</li>
            </ul>
            <div className="mt-3 flex gap-3">
              <Link href="/hyra-ut" className="btn btn-primary">Hyra ut</Link>
              <Link href="/register" className="btn btn-outline">Skapa konto</Link>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}


"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, ButtonGroup } from "@heroui/button";

type TabKey = "studenter" | "foretag" | "hyra";

export default function AudienceTabs() {
  const [tab, setTab] = useState<TabKey>("studenter");

  return (
    <section className="section">
      <div className="container-page">
        <ButtonGroup
          role="tablist"
          aria-label="Målgrupper"
          className="mb-4"
          radius="full"
        >
          <Button
            role="tab"
            aria-selected={tab === "studenter"}
            variant={tab === "studenter" ? "solid" : "bordered"}
            color="success"
            size="sm"
            onPress={() => setTab("studenter")}
          >
            Studenter
          </Button>
          <Button
            role="tab"
            aria-selected={tab === "foretag"}
            variant={tab === "foretag" ? "solid" : "bordered"}
            color="success"
            size="sm"
            onPress={() => setTab("foretag")}
          >
            För företag
          </Button>
          <Button
            role="tab"
            aria-selected={tab === "hyra"}
            variant={tab === "hyra" ? "solid" : "bordered"}
            color="success"
            size="sm"
            onPress={() => setTab("hyra")}
          >
            Hyra ut
          </Button>
        </ButtonGroup>

        {tab === "studenter" && (
          <article className="card shadow-soft">
            <h3 className="h3 mb-2">För dig som letar bostad</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm text-muted">
              <li>Filtrera bland annonser och se kartvy nära din skola.</li>
              <li>Ställ dig i köer och skicka intresse med ett klick.</li>
              <li>Spara tid — allt samlat på ett ställe, gratis.</li>
            </ul>
            <div className="mt-3 flex gap-3">
              <Button as={Link} href="/listings" color="success">
                Se annonser
              </Button>
              <Button as={Link} href="/alla-koer" variant="bordered" color="success">
                Alla köer
              </Button>
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
              <Button as={Link} href="/for-foretag" color="success">
                För företag
              </Button>
              <Button as={Link} href="/kundservice" variant="bordered" color="success">
                Kontakta oss
              </Button>
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
              <Button as={Link} href="/hyra-ut" color="success">
                Hyra ut
              </Button>
              <Button as={Link} href="/register" variant="bordered" color="success">
                Skapa konto
              </Button>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

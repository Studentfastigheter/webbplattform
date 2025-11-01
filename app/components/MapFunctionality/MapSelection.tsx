"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Listing } from "./MapView";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function MapSection() {
  const [data, setData] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/listings", { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject("Kunde inte hämta listings"))
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <section className="mt-16 space-y-4">
      <h2 className="text-2xl sm:text-3xl font-bold">Karta – lediga lägenheter</h2>
      <p className="text-gray-600">Zooma och klicka på markörerna för detaljer.</p>

      {error && <p className="text-red-600">{error}</p>}
      {!data && !error && <p>Laddar karta…</p>}
      {data && <MapView listings={data} />}
    </section>
  );
}
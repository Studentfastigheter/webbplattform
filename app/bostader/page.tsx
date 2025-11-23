"use client";

import ThreeFieldSearch from "@/components/Listings/Search/SearchFilter-3field";
import TwoFieldSearch from "@/components/Listings/Search/SearchFilter-2field";
import OneFieldSearch from "@/components/Listings/Search/SearchFilter-1field";
import type { FieldValue } from "@/components/Listings/Search/SearchFilterBar";
import { Tabs } from "@material-tailwind/react";

export default function Page() {
  return (
    <main className="p-6 space-y-10">
      <section>
        <h1 className="text-2xl font-semibold">[Sidan ska implementeras]</h1>
        <p className="mt-2 text-sm text-gray-600">
          Test av sökkomponenter (3 fält, 2 fält och 1 fält).
        </p>
      </section>

      

      {/* 3 fält – Var, Hyresvärd, Pris */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3 fält – Var / Hyresvärd / Pris</h2>

        <ThreeFieldSearch
          className="max-w-[1000px]"
          field1={{
            id: "city",
            label: "Var",
            placeholder: "Sök studentstad",
            searchable: true,
            multiple: true,
            options: [
              { label: "Göteborg", value: "gbg" },
              { label: "Uppsala", value: "uppsala" },
              { label: "Stockholm", value: "stockholm" },
            ],
          }}
          field2={{
            id: "landlord",
            label: "Hyresvärd",
            placeholder: "Välj hyresvärd",
            searchable: true,
            multiple: true,
            options: [
              { label: "SGS Studentbostäder", value: "sgs" },
              { label: "Chalmers Studentbostäder", value: "csb" },
            ],
          }}
          field3={{
            id: "price",
            label: "Pris",
            placeholder: "Välj prisintervall",
            multiple: false,
            options: [
              { label: "0–3 000 kr", value: "0-3000" },
              { label: "3 000–5 000 kr", value: "3000-5000" },
              { label: "5 000+ kr", value: "5000+" },
            ],
          }}
          onSubmit={(values: Record<string, FieldValue>) => {
            console.log("[3 fält] Sök med:", values);
          }}
        />
      </section>

      {/* 2 fält – T.ex. boendetyp + status */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2 fält – Typ / Status</h2>

        <TwoFieldSearch
          className="max-w-[1000px]"
          field1={{
            id: "dwellingType",
            label: "Boendetyp",
            placeholder: "Välj boendetyp",
            searchable: false,
            multiple: true,
            options: [
              { label: "Lägenhet", value: "apt" },
              { label: "Rum", value: "room" },
              { label: "Korridor", value: "corridor" },
            ],
          }}
          field2={{
            id: "status",
            label: "Status",
            placeholder: "Välj status",
            searchable: false,
            multiple: false,
            options: [
              { label: "Endast lediga", value: "available" },
              { label: "Visa även kö", value: "queue" },
            ],
          }}
          onSubmit={(values: Record<string, FieldValue>) => {
            console.log("[2 fält] Sök med:", values);
          }}
        />
      </section>

      {/* 1 fält – enkel sökruta med dropdownförslag */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1 fält – Sökruta med förslag</h2>

        <OneFieldSearch
          className="max-w-[1000px]"
          field={{
            id: "freeText",
            label: "Sök",
            placeholder: "Sök efter stad, område eller adress",
            options: [
              { label: "Lindholmen, Göteborg", value: "lindholmen" },
              { label: "Kortedala, Göteborg", value: "kortedala" },
              { label: "Flogsta, Uppsala", value: "flogsta" },
            ],
          }}
          onSubmit={(values: Record<string, FieldValue>) => {
            console.log("[1 fält] Sök med:", values);
          }}
        />
      </section>
     
    </main>
  );
}

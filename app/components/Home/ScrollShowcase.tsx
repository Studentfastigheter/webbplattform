"use client";

import Link from "next/link";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FlipWords } from "@/components/ui/flip-words";

export default function ScrollShowcase() {
  return (
    <ContainerScroll
      titleComponent={
        <div className="space-y-4">
          <p className="eyebrow text-brand">CampusLyan</p>
          <h1 className="hero-title text-gradient">
            Lyor för studenter i
            <span className="inline-flex">
              <FlipWords
                words={["Göteborg", "Stockholm", "Lund", "Uppsala"]}
                duration={2500}
              />
            </span>
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            Följ ködagar, se kartvy mot din skola och publicera annonser på minuter. Scrolla för att se hur
            plattformen arbetar åt dig.
          </p>
        </div>
      }
    >
      <div className="flex h-full flex-col gap-6 bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] p-6 text-white rounded-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-slate-300">
            <span className="rounded-full bg-white/10 px-3 py-1">Annonser</span>
            <span className="rounded-full bg-white/10 px-3 py-1">Alla köer</span>
            <span className="rounded-full bg-white/10 px-3 py-1">Hyra ut</span>
          </div>
          <h2 className="text-2xl font-semibold">Hitta din nästa lya, helt gratis</h2>
          <p className="text-slate-200 text-sm max-w-xl">
            Följ dina favoriter, få realtidsstatus på ködagar och hantera intresseanmälningar
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-primary btn-pill">
              Skapa konto
            </Link>
            <Link href="/for-foretag" className="btn btn-outline btn-pill">
              För företag
            </Link>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 h-full">
          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur border border-white/10 col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Karta – Göteborg</span>
              <span>8 bostäder</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-200">
              {["Lindholmen", "Kortedala", "Vasastan", "Majorna"].map((area) => (
                <div key={area} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="font-semibold text-white">{area}</p>
                  <p>4-12 min till skola</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-brand text-white/90 p-4 flex flex-col gap-1">
              <p className="text-sm uppercase tracking-widest text-white/70">Din status</p>
              <p className="text-2xl font-semibold">212 dagar</p>
              <p className="text-sm text-white/80">SGS Studentbostäder</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white text-slate-900 p-4 flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Aktuell annons</p>
              <p className="text-lg font-semibold">1:a Vasastan, 25 m²</p>
              <p className="text-sm text-slate-500">6 200 kr • Inflytt 1 juni</p>
            </div>
            <div className="rounded-xl bg-slate-900 text-white p-3 flex flex-col gap-2">
              <p className="text-sm text-slate-300">8 min till Handelshögskolan</p>
              <p className="text-sm text-slate-300">Husdjur tillåtet • Kallhyra</p>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span>SGS Studentbostäder</span>
                <span className="font-semibold">87 dagar</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chalmers Studentbostäder</span>
                <span className="font-semibold">34 dagar</span>
              </div>
            </div>
            <button className="btn btn-primary btn-pill">Skicka intresse</button>
          </div>
        </div>
      </div>
    </ContainerScroll>
  );
}

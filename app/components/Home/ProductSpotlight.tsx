"use client";

import Reveal from "@/lib/reveal";
import { Button } from "@heroui/button";

export default function ProductSpotlight() {
  return (
    <section className="section bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-white">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal variant="left">
          <div>
            <p className="eyebrow mb-2 text-brand dark:text-brand">Plattformen</p>
            <h2 className="h2 mb-4 text-slate-900 dark:text-white">
              Allt du behöver för att hitta – eller lista – studentbostäder
            </h2>
            <p className="mb-6 text-base text-slate-600 dark:text-slate-300">
              CampusLyan samlar annonser, köer och intressehantering i ett och samma gränssnitt. Studenter får koll på sina chanser,
              medan bostadsbolag och privatvärdar publicerar på minuter – tryggt och smidigt.
            </p>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-black/5 bg-white/95 p-4 text-left shadow-soft dark:border-white/10 dark:bg-slate-900/80">
                <div className="font-semibold text-slate-900 dark:text-white">Allt på ett ställe</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Annonser, köer och intresseanmälningar i en vy – slipp hoppa mellan olika portaler.
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/95 p-4 text-left shadow-soft dark:border-white/10 dark:bg-slate-900/80">
                <div className="font-semibold text-slate-900 dark:text-white">Överblick i realtid</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Följ läget direkt: placering i kö, visningar och inkommande intressen.
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/95 p-4 text-left shadow-soft dark:border-white/10 dark:bg-slate-900/80">
                <div className="font-semibold text-slate-900 dark:text-white">Tryggt för alla</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Verifierade aktörer och tydliga regler – säkrare publicering för både företag och privatpersoner.
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/95 p-4 text-left shadow-soft dark:border-white/10 dark:bg-slate-900/80">
                <div className="font-semibold text-slate-900 dark:text-white">Smidig uthyrning för privatpersoner</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  CampusLyan guidar dig genom hela processen – från annons till färdiga avtal. Perfekt även för dig som aldrig hyrt ut tidigare.
                </p>
              </div>
            </div>

          </div>
        </Reveal>
        <Reveal variant="right" delay={120}>
          <div className="relative mx-auto w-full max-w-[450px] rounded-[32px] bg-gradient-to-br bg-white p-6 text-slate-900 shadow-[0_25px_80px_rgba(2,6,23,0.55)] ring-1 ring-white/10">
            {/* Header / vyväxling */}
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-slate-900">
              <span className="rounded-full bg-black/5 px-3 py-1">Uthyrarvy</span>
              <span className="rounded-full bg-black/5 px-3 py-1">Företag</span>
              <span className="rounded-full bg-black/5 px-3 py-1">Privat</span>
            </div>

            <div className="mt-6 space-y-4">
              {/* Mina annonser */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-900">Mina annonser</p>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    Verifierad uthyrarprofil
                  </span>
                </div>
                

                {/* Annons #1 */}
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">1:a i Vasastan · 25 m² · 6 200 kr</p>
                      <p className="text-xs text-slate-600">Publicerad • Synlig för verifierade studenter</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                      Aktiv
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Visningar: <strong className="text-slate-900">1 284</strong></span>
                    <span className="text-slate-600">Intressen: <strong className="text-slate-900">37</strong></span>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Rum i Guldheden · 14 m² · 3 900 kr</p>
                      <p className="text-xs text-slate-600">Utkast • Komplettera uppgifter innan publicering</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100">
                      Utkast
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Förhandsvisningar: <strong className="text-slate-900">12</strong></span>
                    <span className="text-slate-600">Intressen: <strong className="text-slate-900">0</strong></span>
                  </div>
                </div>
              </div>

              {/* Intresserade studenter + plats för diagram */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-900">Intresserade studenter</p>
                

                {/* Snabblista med leads – samma kantstil per rad */}
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <span className="truncate">
                      <strong>Elin</strong> • Civilingenjör • Inflytt 1 jun • Husdjur OK
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <span className="truncate">
                      <strong>Victor</strong> • Masterstudent • Garanterad inkomst • Rökfri
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                    <span className="truncate">
                      <strong>Linnea</strong> • Utbytesstudent • Önskar möblerat
                    </span>
                  </li>
                </ul>

                <Button size="sm" color="success" variant="solid" radius="full" className="mt-3 w-full justify-center text-sm text-white bg-[#004225] hover:bg-[#004225]/90">Visa alla</Button>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-30 blur-3xl ring-1 ring-white/5" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

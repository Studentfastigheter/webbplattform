"use client";

import Reveal from "@/lib/reveal";
import { Button } from "@/components/ui/button";

export default function ProductSpotlight() {
  return (
    <section className="section bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-white">
      <div className="container-page flex flex-col gap-10 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal variant="left">
          <div className="flex flex-col gap-4">
            <p className="eyebrow mb-2 text-brand dark:text-brand">Plattformen</p>
            <h2 className="h2 text-slate-900 dark:text-white">
              Allt du behöver för att hitta – eller lista – studentbostäder
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300">
              CampusLyan samlar annonser, köer och intressehantering i ett och samma gränssnitt. Studenter får koll på sina chanser,
              medan bostadsbolag och privatvärdar publicerar på minuter – tryggt och smidigt.
            </p>

            <div className="grid gap-3 sm:gap-4">
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
                <div className="font-semibold text-slate-900 dark:text-white">All info i ett flöde</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Köregler, krav, avtal, guider, spartips och ekonomigenomgångar – lättillgängligt för alla.
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/95 p-4 text-left shadow-soft dark:border-white/10 dark:bg-slate-900/80">
                <div className="font-semibold text-slate-900 dark:text-white">Smidigt även för privat</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  CampusLyan guidar genom hela uthyrningen – från annons till avtal – perfekt även för förstagångsuthyrare.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal variant="right" delay={120}>
          <div className="relative mx-auto w-full rounded-[28px] bg-gradient-to-br from-white to-slate-50 p-4 text-slate-900 shadow-[0_20px_55px_rgba(2,6,23,0.35)] ring-1 ring-white/10 sm:rounded-[32px] sm:p-6 lg:max-w-[450px]">
            {/* Header / view toggle */}
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-slate-900">
              <span className="rounded-full bg-black/5 px-3 py-1">Uthyrarvy</span>
              <span className="rounded-full bg-black/5 px-3 py-1">Företag</span>
              <span className="rounded-full bg-black/5 px-3 py-1">Privat</span>
            </div>

            <div className="mt-6 space-y-4">
              {/* Mina annonser */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-900">Mina annonser</p>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    Verifierad uthyrarprofil
                  </span>
                </div>

                {/* Annons #1 */}
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div>
                      <p className="text-sm font-semibold">1:a i Vasastan · 25 m² · 6 200 kr</p>
                      <p className="text-xs text-slate-600">Publicerad • Synlig för verifierade studenter</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                      Aktiv
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      Visningar: <strong className="text-slate-900">1 284</strong>
                    </span>
                    <span className="text-slate-600">
                      Intressen: <strong className="text-slate-900">37</strong>
                    </span>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div>
                      <p className="text-sm font-semibold">Rum i Guldheden · 14 m² · 3 900 kr</p>
                      <p className="text-xs text-slate-600">Utkast • Komplettera uppgifter innan publicering</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100">
                      Utkast
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      Förhandsvisningar: <strong className="text-slate-900">12</strong>
                    </span>
                    <span className="text-slate-600">
                      Intressen: <strong className="text-slate-900">0</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Intresserade studenter */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-900">Intresserade studenter</p>

                <ul className="mt-4 space-y-2 text-sm">
                  <li className="rounded-lg border border-slate-200 p-3">
                    <span>
                      <strong>Elin</strong> • Civilingenjör • Inflytt 1 jun • Husdjur OK
                    </span>
                  </li>
                  <li className="rounded-lg border border-slate-200 p-3">
                    <span>
                      <strong>Victor</strong> • Masterstudent • Garanterad inkomst • Rökfri
                    </span>
                  </li>
                  <li className="rounded-lg border border-slate-200 p-3">
                    <span>
                      <strong>Linnea</strong> • Utbytesstudent • Önskar möblerat
                    </span>
                  </li>
                </ul>

                <Button size="sm" fullWidth className="mt-3">
                  Visa alla
                </Button>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-30 blur-3xl ring-1 ring-white/5" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

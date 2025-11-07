"use client";

import Reveal from "@/lib/reveal";

const sellingPoints = [
  {
    title: "Allt på en plats",
    desc: "Annonser, köer och intresseanmälningar samlas i samma vy så du slipper hoppa mellan portaler.",
  },
  {
    title: "Översikt i realtid",
    desc: "Se hur långt du kommit i varje kö och vilka lägenheter som finns nära din skola.",
  },
  {
    title: "Tryggt för företag",
    desc: "Verifierade bostadsbolag och privatvärdar publicerar via samma flöde – vi ser till att allt följer reglerna.",
  },
];

const queueItems = [
  { name: "SGS Studentbostäder", days: "212 dagar" },
  { name: "HSB Living Lab", days: "87 dagar" },
  { name: "Privatvärd Södra", days: "34 dagar" },
];

const heroStats = [
  { name: "SGS Studentbostäder", value: "87 dagar" },
  { name: "Chalmers Studentbostäder", value: "34 dagar" },
];

const highlight = {
  title: "Aktuell annons",
  line: "1:a Vasastan · 25 m² · 6 200 kr",
  meta: "8 min till Handelshögskolan · Kallhyra · Inflytt 1 jun · Husdjur tillåtet",
};

export default function ProductSpotlight() {
  return (
    <section className="section bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-white">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal variant="left">
          <div>
            <p className="eyebrow mb-2 text-brand dark:text-brand">Plattformen</p>
            <h2 className="h2 mb-4 text-slate-900 dark:text-white">Allt du behöver för att hitta – eller lista – studentbostäder</h2>
            <p className="mb-6 text-base text-slate-600 dark:text-slate-300">
              CampusLyan kombinerar annonser, köer och intressehantering i ett och samma gränssnitt. Studenter får full koll
              på sina chanser, medan bostadsbolag och privatvärdar kan publicera på minuter.
            </p>
            <div className="grid gap-4">
              {sellingPoints.map((point) => (
                <div
                  key={point.title}
                  className="rounded-2xl border border-black/5 bg-white/95 p-4 text-left shadow-soft dark:border-white/10 dark:bg-slate-900/80"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">{point.title}</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{point.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal variant="right" delay={120}>
          <div className="relative mx-auto w-full max-w-[420px] rounded-[32px] bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] p-6 text-white shadow-[0_25px_80px_rgba(2,6,23,0.55)] ring-1 ring-white/10">
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              {["Annonser", "Alla köer", "Hyra ut"].map((chip) => (
                <span key={chip} className="rounded-full bg-white/10 px-3 py-1">
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-200">Mina köer</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-100">
                  {queueItems.map((queue) => (
                    <li key={queue.name} className="flex items-center justify-between">
                      <span className="font-medium text-white">{queue.name}</span>
                      <span className="text-base font-semibold text-white">{queue.days}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{highlight.title}</p>
                <p className="mt-3 text-lg font-semibold leading-tight">{highlight.line}</p>
                <p className="mt-2 text-sm text-slate-500">{highlight.meta}</p>
                <button className="btn btn-primary btn-pill mt-5 w-full">Skicka intresse</button>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {heroStats.map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between">
                    <span>{stat.name}</span>
                    <span className="font-semibold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-30 blur-3xl ring-1 ring-white/5" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

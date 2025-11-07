"use client";

import Reveal from "@/lib/reveal";

const stats = [
  { key: "hyresvardar", value: "25+", label: "Hyresvärdar" },
  { key: "studentstader", value: "30+", label: "Studentstäder" },
  { key: "kostnad", value: "0 kr", label: "Alltid gratis" },
  { key: "tryggt", value: "GDPR", label: "Trygg integritet" },
];

export default function StatsBar() {
  return (
    <section className="section bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, idx) => (
          <Reveal key={item.key} variant="up" delay={idx * 80}>
            <div className="rounded-2xl border border-black/5 bg-white/95 p-6 text-center shadow-soft dark:border-white/10 dark:bg-slate-900/80">
              <div className="text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{item.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

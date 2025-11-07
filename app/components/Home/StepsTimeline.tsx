"use client";

import Reveal from "@/lib/reveal";

const steps = [
  {
    title: "Skapa konto",
    desc: "Registrera dig gratis, välj skola och lås upp kartvyer, köer och rekommenderade annonser.",
  },
  {
    title: "Utforska och följ",
    desc: "Filtrera, följ favoriter och ställ dig i köer från samma dashboard.",
  },
  {
    title: "Få svar & flytta in",
    desc: "Samla alla svar och intresseanmälningar i ett flöde – boka visning och skriv kontrakt utan krångel.",
  },
];

export default function StepsTimeline() {
  return (
    <section className="section section-edge bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="container-page">
        <Reveal variant="up">
          <p className="eyebrow mb-2 text-brand dark:text-brand">Så funkar det</p>
          <h2 className="h2 mb-6 text-slate-900 dark:text-white">Från registrering till inflytt på tre steg</h2>
        </Reveal>
        <div className="timeline">
          {steps.map((step, idx) => (
            <Reveal key={step.title} variant="up" delay={idx * 120}>
              <article className="timeline-item border border-black/5 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-white">
                <div className="timeline-index bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">{idx + 1}</div>
                <div>
                  <div className="font-semibold">{step.title}</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{step.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

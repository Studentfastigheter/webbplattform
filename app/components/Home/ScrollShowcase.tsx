"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FlipWords } from "@/components/ui/flip-words";


export default function ScrollShowcase() {
  return (
    <ContainerScroll
      titleComponent={
        <div className="space-y-4">
          <p className="eyebrow text-brand">CampusLyan</p>
          <h1 className="hero-title text-gradient mb-12">
            Lyor för studenter i
            <span className="inline-flex">
              <FlipWords
                words={["Göteborg", "Stockholm", "Lund", "Uppsala"]}
                duration={2500}
              />
            </span>
          </h1>
        </div>
      }
    >
      <div className="flex h-full flex-col gap-6 bg-gradient-to-br bg-white p-6 text-slate-900 rounded-2xl">
        <div className="flex flex-col gap-4 ">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-slate-900">
            <span className="rounded-full bg-slate-900/10 px-3 py-1">Annonser</span>
            <span className="rounded-full bg-slate-900/10 px-3 py-1">Alla köer</span>
            <span className="rounded-full bg-slate-900/10 px-3 py-1">Hyra ut</span>
          </div>
          <h2 className="text-2xl font-semibold">Hitta din nästa lya, helt gratis</h2>
          <p className="text-slate-900 text-sm max-w-xl">
            Följ dina favoriter, få realtidsstatus på ködagar och hantera intresseanmälningar
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 h-full">
          <div className="col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-inner">
          </div>
          <div className="rounded-2xl bg-slate-800 p-4 flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-200">Aktuell annons</p>
              <p className="text-lg font-semibold text-slate-200">1:a Vasastan, 25 m²</p>
              <p className="text-sm text-slate-200">6 200 kr • Inflytt 1 juni</p>
            </div>
            <div className="rounded-xl bg-slate-900 text-white p-3 flex flex-col gap-2">
              <p className="text-sm text-slate-200">8 min till Handelshögskolan</p>
              <p className="text-sm text-slate-200">Husdjur tillåtet • Kallhyra</p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span>SGS Studentbostäder</span>
                <span className="font-semibold">87 dagar</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chalmers Studentbostäder</span>
                <span className="font-semibold">34 dagar</span>
              </div>
            </div>
            <button className="btn btn-primary btn-pill text-slate-200">Skicka intresse</button>
          </div>
        </div>
      </div>
    </ContainerScroll>
  );
}

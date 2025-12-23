"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FlipWords } from "@/components/ui/flip-words";
import Image from "next/image";
import { Button } from "@heroui/button";


export default function ScrollShowcase() {
  return (
    <ContainerScroll
      titleComponent={
        <div className="space-y-4">
          <p className="eyebrow text-brand">Snart lanseras CampusLyan</p>
          <h1 className="hero-title text-gradient mb-12 flex flex-col items-center gap-y-3 text-center leading-tight md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-x-4">
            <span className="flex-shrink-0">Lyor för studenter i</span>
            <span className="inline-flex justify-center">
              <FlipWords
                words={["Göteborg", "Stockholm", "Lund", "Uppsala", "Linköping", "Karlstad", "Örebro", "Malmö", "Växjö", "Helsingborg", "Jönköping", "Umeå"]}
                duration={2500}
              />
            </span>
          </h1>
        </div>
      }
    >
      <div className="flex h-full flex-col gap-6 rounded-2xl bg-white/5 p-6 text-slate-800">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-slate-700">
            <span className="rounded-full bg-black/5 px-3 py-1">Alla bostadsbolag</span>
            <span className="rounded-full bg-black/5 px-3 py-1">Samlade bostadsköer</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Sök smartare – vi samlar alla lediga lyor på ett ställe</h2>
          <p className="text-slate-900 text-sm max-w-xl">
            Sluta leta på dussintals olika sidor. Vi aggregerar annonser från stadens största studentbostadsföretag så att du får en komplett överblick direkt.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 h-full">
          <div className="relative col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-inner">
            <Image
              src="/appartment.jpg"
              alt="Showcase appartment"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-white p-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-600">Direkt från hyresvärd</p>
              <p className="text-lg font-semibold text-slate-900">1:a Vasastan, 25 m²</p>
              <p className="text-sm text-slate-700">4 200 kr/mån • Inflytt 1 aug</p>
            </div>
            
            <div className="flex flex-col gap-2 rounded-xl bg-black/5 p-3">
              <p className="text-sm text-slate-700">📍 8 min cykel till Campus</p>
              <p className="text-sm text-slate-700">✨ Studentrabatt • Bredband ingår</p>
            </div>
            <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-700">Uthyrare</p>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    Verifierad hyresvärd
                  </span>
                </div>
            <div className="flex flex-col gap-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>SGS Studentbostäder</span>
                <p className="text-[11px] text-slate-500 mt-1">| 4.8 av 5</p>
                <p className="text-sm font-semibold flex items-center justify-center gap-0.5 text-amber-500">
                  ★★★★★
                </p>
              </div>
            </div>
            <Button color="success" variant="solid" radius="full" className="mt-1 w-full justify-center text-white bg-[#004225] hover:bg-[#004225]/90">
              Visa annons & ansök
            </Button>
          </div>
        </div>
      </div>
    </ContainerScroll>
  );
}

"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FlipWords } from "@/components/ui/flip-words";
import Image from "next/image";
import { Button } from "@heroui/button";


export default function ScrollShowcase() {
  return (
    <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center justify-center space-y-6 mb-10 lg:mb-20">
            {/* Badge / Eyebrow - Matchar Hero stilen */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Snart lanseras CampusLyan
            </div>

            {/* Rubrik med FlipWords */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] text-center max-w-4xl mx-auto">
              Lyor för studenter i <br className="hidden md:block" />
              <span className="inline-block mt-2 md:mt-0 text-emerald-600">
                <FlipWords
                  words={["Göteborg", "Stockholm", "Lund", "Uppsala", "Linköping", "Örebro", "Malmö", "Umeå"]}
                  duration={2500}
                  className="text-emerald-600"
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

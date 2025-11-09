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
      <div className="flex h-full flex-col gap-6 rounded-2xl bg-white/5 p-6 text-slate-800">
        <div className="flex flex-col gap-4 ">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-widest text-slate-700">
            <span className="rounded-full bg-black/5 px-3 py-1">Verifierade annonser</span>
            <span className="rounded-full bg-black/5 px-3 py-1">Alla bostadsköer</span>
            <span className="rounded-full bg-black/5 px-3 py-1">Hyra ut rum</span>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Hitta din nästa lya - gratis och tryggt</h2>
          <p className="text-slate-900 text-sm max-w-xl">
            
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
              <p className="text-xs uppercase tracking-widest text-slate-600">Aktuell annons</p>
              <p className="text-lg font-semibold text-slate-900">1:a Vasastan, 25 m²</p>
              <p className="text-sm text-slate-700">6 200 kr • Inflytt 1 juni</p>
            </div>
            
            <div className="flex flex-col gap-2 rounded-xl bg-black/5 p-3">
              <p className="text-sm text-slate-700">8 min till Handelshögskolan</p>
              <p className="text-sm text-slate-700">Husdjur tillåtet • Kallhyra</p>
            </div>
            <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-700">Uthyrare</p>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    Verifierad uthyrarprofil
                  </span>
                </div>
            <div className="flex flex-col gap-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>SGS Studentbostäder</span>
                <span className="font-semibold text-slate-900">68 dagar</span>
              </div>
              <div className="rounded-lg bg-white p-1 text-center ring-1 ring-slate-200">
                <p className="text-[11px] text-slate-500">Betyg</p>
                <p className="text-sm font-semibold flex items-center justify-center gap-0.5 text-amber-500">
                  ★★★★★
                </p>
                <p className="text-[11px] text-slate-500 mt-1">4.8 av 5</p>
              </div>
            </div>
            <Button color="success" variant="solid" radius="full" className="mt-1 w-full justify-center text-white bg-[#004225] hover:bg-[#004225]/90">
              Skicka intresse
            </Button>
          </div>
        </div>
      </div>
    </ContainerScroll>
  );
}

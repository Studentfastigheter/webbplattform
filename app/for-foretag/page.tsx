"use client";

import React from "react";
import {
  AppWindow,
  ArrowRight,
  Check,
  Search,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BookingSection } from "@/components/features/business/BookingSection";
import { Hero } from "@/components/features/business/Hero";
import { Testimonials } from "@/components/features/business/Testimonial";
import { Implementation } from "@/components/features/business/Implementation";
import { SectionBadge } from "@/components/ui/section-badge";

type FeatureRowProps = {
  flipped?: boolean;
  tag: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const FeatureRow = ({
  flipped = false,
  tag,
  title,
  description,
  children,
}: FeatureRowProps) => {
  return (
    <div className={`flex flex-col items-center gap-8 ${flipped ? "lg:flex-row-reverse" : "lg:flex-row"} lg:gap-16`}>
      <div className="flex-1 space-y-4 text-left">
        <SectionBadge text={tag} className="mb-2" />
        <h2 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">{title}</h2>
        <p className="text-lg leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <div className="w-full flex-1">{children}</div>
    </div>
  );
};

export default function ForForetagPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-secondary selection:text-foreground">
      <Hero
        title={
          <span>
            Marknadsför till <span className="text-pop-contrast">Sveriges studenter</span>
          </span>
        }
        description="Anslut ditt fastighetssystem och nå hela marknaden automatiskt. Vi verifierar studenterna enligt din kravprofil, så att du kan fylla vakanserna helt utan administration."
        primaryCtaText="Kom igång"
        primaryCtaLink="#bokning"
      />

      <section className="relative z-10 mx-auto max-w-7xl space-y-24 px-6 py-16 lg:space-y-32 lg:py-32">
        <FeatureRow
          flipped
          tag="Räckvidd"
          title="Den optimala marknadskanalen"
          description="Med CampusLyan når ni ut till alla studenter i Sverige på ett och samma ställe. Vi samlar studenterna i en gemensam plattform, vilket ger er maximal exponering mot rätt målgrupp utan onödigt spill."
        >
          <div className="relative flex h-[350px] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-border bg-card p-4 shadow-lg lg:h-[480px] lg:p-8">
            <div className="z-20 mb-6 flex h-10 w-52 items-center rounded-full border border-border bg-background px-4 shadow-sm lg:mb-8 lg:h-12 lg:w-64">
              <Search className="mr-3 h-4 w-4 text-primary lg:h-5 lg:w-5" />
              <div className="h-2 w-24 rounded-full bg-secondary" />
            </div>

            <div className="relative z-10 w-64 space-y-3 lg:w-72">
              <div className="animate-[slideUp_4s_infinite] flex items-center gap-4 rounded-xl border border-border bg-background p-3 shadow-md lg:p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary lg:h-10 lg:w-10">
                  <Users size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 h-2 w-20 rounded-full bg-foreground" />
                  <div className="h-1.5 w-12 rounded-full bg-border" />
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                  <Check size={14} className="text-primary" />
                </div>
              </div>

              <div className="animate-[slideUp_4s_infinite_1s] flex items-center gap-4 rounded-xl border border-border bg-background p-3 opacity-70 scale-95 shadow-md lg:p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary lg:h-10 lg:w-10">
                  <Users size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 h-2 w-16 rounded-full bg-foreground" />
                  <div className="h-1.5 w-10 rounded-full bg-border" />
                </div>
              </div>

              <div className="animate-[slideUp_4s_infinite_2s] flex items-center gap-4 rounded-xl border border-border bg-background p-3 opacity-40 scale-90 shadow-md lg:p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary lg:h-10 lg:w-10">
                  <Users size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 h-2 w-24 rounded-full bg-foreground" />
                  <div className="h-1.5 w-14 rounded-full bg-border" />
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/50 via-transparent to-transparent" />
          </div>
        </FeatureRow>

        <FeatureRow
          tag="Kvalitetssäkring"
          title="Verifierade studenter – inga spökanvändare"
          description="Vi säkerställer att alla registrerade användare är aktiva studenter genom strikt verifiering. Detta eliminerar spökanvändare i era bostadsköer och garanterar att ni enbart hanterar ansökningar från behöriga sökande."
        >
          <div className="group relative flex h-[350px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-primary bg-primary p-4 shadow-2xl shadow-primary/40 lg:h-[480px] lg:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative w-full max-w-sm">
              <div className="relative rounded-2xl border border-border/30 bg-pop/70 p-1 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-pop/40">
                <div className="relative overflow-hidden rounded-xl bg-primary p-4 lg:p-6">
                  <div className="absolute left-0 right-0 top-0 z-20 h-1 animate-[scan_3s_ease-in-out_infinite] bg-pop-contrast shadow-[0_0_20px_rgba(160,78,35,0.8)]" />

                  <div className="mb-6 flex items-start justify-between lg:mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/30 bg-secondary/20 lg:h-16 lg:w-16">
                      <Users className="text-primary-foreground/70" size={24} />
                    </div>
                    <ShieldCheck className="h-6 w-6 text-pop-contrast lg:h-8 lg:w-8" />
                  </div>

                  <div className="mb-4 space-y-3 lg:mb-6 lg:space-y-4">
                    <div className="h-2 w-1/3 rounded-full bg-secondary/40" />
                    <div className="h-2 w-3/4 rounded-full bg-secondary/40" />
                    <div className="h-2 w-1/2 rounded-full bg-secondary/40" />
                  </div>

                  <div className="mt-6 flex items-center gap-2 rounded-lg border border-brand-green-light/30 bg-pop-contrast/20 p-2 lg:mt-8 lg:p-3">
                    <div className="rounded-full bg-brand-green-light p-1">
                      <Check size={10} className="text-white" strokeWidth={4} />
                    </div>
                    <span className="text-xs font-bold tracking-wide text-brand-green-light lg:text-sm">VERIFIERAD STUDENT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FeatureRow>

        <FeatureRow
          flipped
          tag="Integration"
          title="Sömlös systemkoppling"
          description="Arbeta kvar i era befintliga processer. Tack vare våra färdiga integrationer kopplar ni enkelt ihop CampusLyan direkt med ert nuvarande fastighetssystem för automatiserad publicering och hantering."
        >
          <div className="relative flex h-[350px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-border bg-card p-4 lg:h-[480px] lg:p-8">
            <div className="z-10 flex w-full max-w-lg scale-90 items-center justify-center gap-2 md:gap-8 lg:scale-100">
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background shadow-sm lg:h-24 lg:w-24">
                  <Server size={28} className="text-muted-foreground" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground lg:text-xs">Ert System</span>
              </div>

              <div className="relative h-px min-w-[40px] flex-1 bg-border lg:min-w-[60px]">
                <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background p-1.5 lg:p-2">
                  <ArrowRight size={14} className="text-primary" />
                </div>
                <div className="absolute left-0 top-[-3px] h-2 w-2 rounded-full bg-primary animate-[moveRight_2s_linear_infinite]" />
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background shadow-sm lg:h-24 lg:w-24">
                  <div className="absolute top-0 h-4 w-full bg-background/60" />
                  <AppWindow size={28} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary lg:text-xs">CampusLyan</span>
              </div>
            </div>

            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>
        </FeatureRow>
      </section>

      <Testimonials />
      <Implementation />
      <BookingSection
        title="Nyfiken på mer räckvidd?"
        description="Vi berättar gärna mer"
      />
    </div>
  );
}

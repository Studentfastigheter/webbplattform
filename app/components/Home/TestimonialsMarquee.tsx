"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const testimonials = [
  {
    quote: "Jag hittade ett rum nära min skola på två dagar. Köstatus och kartan hjälpte mig prioritera rätt bostäder.",
    name: "Emma, student Göteborg",
    title: "Civilingenjörsutbildning",
  },
  {
    quote: "Som privatvärd publicerar jag ett rum på några minuter och samlar alla intressen på ett ställe.",
    name: "Jonas, privatvärd",
    title: "Hyresvärd i Stockholm",
  },
  {
    quote: "Vi når studenterna där de faktiskt letar. CampusLyan har blivit en viktig kanal för våra projekt.",
    name: "Sara, bostadsbolag",
    title: "Marknadschef, StudentBo",
  },
  {
    quote: "Notifieringarna är guld. Jag missar inte när nya annonser dyker upp i min stad.",
    name: "Linnea, student Malmö",
    title: "Designprogrammet",
  },
];

export default function TestimonialsMarquee() {
  return (
    <section className="section bg-neutral-50">
      <div className="container-page space-y-6">
        <div className="text-center space-y-2">
          <p className="eyebrow text-brand">Vad andra säger</p>
          <h2 className="h2">Tusentals studenter och värdar använder CampusLyan</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Scrolla igenom ett axplock av röster från både studenter och bostadsaktörer som redan använder plattformen.
          </p>
        </div>
        <InfiniteMovingCards items={testimonials} speed="slow" />
      </div>
    </section>
  );
}


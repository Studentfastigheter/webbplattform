"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
const testimonials = [
  {
    quote: "Det bästa är att slippa ha 15 flikar öppna. Här ser jag kötid till alla stora bolag och restiden till campus i samma vy.",
    name: "Emma, Chalmers",
    title: "Göteborg",
  },
  {
    quote: "Hittade äntligen en trygg privat uthyrare här. Det känns mycket säkrare än de skumma grupperna på Facebook.",
    name: "Linnea, Malmö Universitet",
    title: "Malmö",
  },
  {
    quote: "Jag fick notifieringar så fort en lya som matchade mina poäng dök upp. Sjukt smidigt när man har panik inför terminsstart.",
    name: "Victor, Uppsala Universitet",
    title: "Uppsala",
  },
  {
    quote: "Som student är det guld värt att allt är gratis. Äntligen en samlingsplats som faktiskt förstår hur vi letar boende.",
    name: "Hanna, KTH",
    title: "Stockholm",
  },
];

export default function TestimonialsMarquee() {
  return (
    <section className="section bg-brand-beige-100">
      <div className="container-page space-y-6">
        <div className="text-center space-y-2">
          <p className="eyebrow text-pop font-bold uppercase tracking-wide">Vad andra säger</p>
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

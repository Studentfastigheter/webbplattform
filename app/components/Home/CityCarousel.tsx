"use client";

import { Carousel, Card as AppleCarouselCard } from "@/components/ui/apple-cards-carousel";

const cityCards = [
  {
    title: "Göteborg",
    category: "300+ studentlägenheter",
    src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
    content: (
      <p className="text-slate-600 text-base">
        SGS, privata värdar och nya projekt nära Chalmers och Handelshögskolan. Kartvyn hjälper dig hitta rätt stadsdel.
      </p>
    ),
  },
  {
    title: "Stockholm",
    category: "450+ studentrum",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    content: (
      <p className="text-slate-600 text-base">
        Följ SSSB, nya hyresvärdar och rumsannonser i Vasastan, Solna och Södermalm – notifieringar i samma flöde.
      </p>
    ),
  },
  {
    title: "Lund",
    category: "200+ boenden",
    src: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80",
    content: (
      <p className="text-slate-600 text-base">
        AF-bostäder, nationer och privatvärdar i centrala Lund och Brunnshög. Spara köer och bevaka rum i samma dashboard.
      </p>
    ),
  },
  {
    title: "Uppsala",
    category: "160+ listade objekt",
    src: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1200&q=80",
    content: (
      <p className="text-slate-600 text-base">
        Nationer, stiftelser och nya hyreshus nära Ultuna, Ekonomikum och centrum – allt filtrerat efter din skola.
      </p>
    ),
  },
];

export default function CityCarousel() {
  return (
    <section className="section">
      <div className="container-page text-center space-y-3">
        <p className="eyebrow text-brand">Studentstäder</p>
        <h2 className="h2">Exempel på städer där CampusLyan är aktivt</h2>
        <p className="text-muted max-w-2xl mx-auto">
          Öppna ett kort för att se vad som händer i respektive stad – köer, privata värdar och notifieringar.
        </p>
      </div>
      <div className="mt-10">
        <Carousel
          items={cityCards.map((city, idx) => (
            <AppleCarouselCard key={city.title} card={city} index={idx} layout />
          ))}
        />
      </div>
    </section>
  );
}


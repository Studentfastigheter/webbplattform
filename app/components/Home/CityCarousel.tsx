"use client";

import { Carousel, Card as AppleCarouselCard } from "@/components/ui/apple-cards-carousel";

const cityCards = [
  {
    title: "Göteborg",
    category: "Från SGS till dolda pärlor",
    src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
    content: (
      <p className="text-slate-600 text-base">
        Hitta hem nära Chalmers, Handels eller GU. Vi samlar stadens största bolag och verifierade privatvärdar så att du kan bo tryggt i Majorna, Johanneberg eller Guldheden.
      </p>
    ),
  },
  {
    title: "Stockholm",
    category: "Hela huvudstaden på ett ställe",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    content: (
      <p className="text-slate-600 text-base">
        Oavsett om du pluggar på KTH, SU eller KI hjälper vi dig navigera mellan SSSB:s köer och lediga rum i Vasastan eller på Södermalm. Få notiser direkt när något dyker upp.
      </p>
    ),
  },
  {
    title: "Lund",
    category: "Studentlivets hjärta",
    src: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80",
    content: (
      <p className="text-slate-600 text-base">
        Från AF Bostäder till nationernas korridorer. Vi guidar dig genom Lunds unika bostadsmarknad så att du hittar en plats nära din nation eller LTH.
      </p>
    ),
  },
  {
    title: "Uppsala",
    category: "Från nationer till nyproduktion",
    src: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=1200&q=80",
    content: (
      <p className="text-slate-600 text-base">
        Bevaka lediga objekt nära Ekonomikum, BMC och Ultuna. Vi samlar information från stiftelser, bolag och privatpersoner så att du maxar dina chanser i Sveriges äldsta studentstad.
      </p>
    ),
  },
];

export default function CityCarousel() {
  return (
    <section className="section">
      <div className="container-page text-center space-y-3">
        <p className="eyebrow text-brand">Hitta ditt campus</p>
        <h2 className="h2">Vi täcker Sveriges mest populära studentstäder</h2>
        <p className="text-brand max-w-2xl mx-auto">
          Oavsett var du har kommit in hjälper vi dig att samla köerna, bevaka områdena och hitta ditt nästa hem – helt anpassat efter din studieort.
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


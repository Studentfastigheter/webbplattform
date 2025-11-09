"use client";

import MapSection from "./components/MapFunctionality/MapSelection";
import Suggested from "./components/Listings/Suggested";
import SchoolSelector from "./components/School/SchoolSelector";
import RelevantQueues from "./components/Queues/RelevantQueues";
import { useAuth } from "@/context/AuthContext";
import ScrollShowcase from "./components/Home/ScrollShowcase";
import CompaniesMarquee from "./components/Home/CompaniesMarquee";
import StatsBar from "./components/Home/StatsBar";
import ProductSpotlight from "./components/Home/ProductSpotlight";
import TestimonialsMarquee from "./components/Home/TestimonialsMarquee";
import Features from "./components/Home/Features";
import StepsTimeline from "./components/Home/StepsTimeline";
import CityCarousel from "./components/Home/CityCarousel";
import Faq from "./components/Home/Faq";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      {!user && (
        <>
          <ScrollShowcase />
          {/*<CompaniesMarquee />*/}
          {/*<StatsBar />*/}
          <ProductSpotlight />
          <Features />
          <StepsTimeline />
          {/*<TestimonialsMarquee />*/}
          {/*<CityCarousel />*/}
          <Faq />
        </>
      )}

      {user && (
        <>
          {/* Karta (endast inloggad) */}
          <section className="section" id="map">
            <div className="container-page">
              <SchoolSelector />
              <div className="mt-6">
                <MapSection />
              </div>
            </div>
          </section>

          {/* Förslag under kartan */}
          <section className="section">
            <div className="container-page">
              <Suggested />
            </div>
          </section>

          {/* Relevanta köer för vald skola */}
          <section className="section" id="queues">
            <div className="container-page">
              <RelevantQueues />
            </div>
          </section>
        </>
      )}
    </>
  );
}

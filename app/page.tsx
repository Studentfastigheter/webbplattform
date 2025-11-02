"use client";

import Intro from "./components/Intro";
import Sponsors from "./components/Sponsors";
import MapSection from "./components/MapFunctionality/MapSelection";
import Suggested from "./components/Listings/Suggested";
import SchoolSelector from "./components/School/SchoolSelector";
import RelevantQueues from "./components/Queues/RelevantQueues";
import { useAuth } from "@/context/AuthContext";
import Hero from "./components/Home/Hero";
import Trusted from "./components/Home/Trusted";
import Features from "./components/Home/Features";
import CompaniesMarquee from "./components/Home/CompaniesMarquee";
import StudentCities from "./components/Home/StudentCities";
import Faq from "./components/Home/Faq";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      {!user && (
        <>
          <Hero />
          <Features />
          <StudentCities />
          <Faq />
          <CompaniesMarquee />
        </>
      )}

      {/* Karta */}
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

      {/* Relevanta köer för vald skola (främst för inloggade) */}
      <section className="section" id="queues">
        <div className="container-page">
          <RelevantQueues />
        </div>
      </section>
    </>
  );
}

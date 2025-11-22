"use client";

import { useAuth } from "@/context/AuthContext";
import ScrollShowcase from "../components/Landingpage/ScrollShowcase";
import ProductSpotlight from "../components/Landingpage/ProductSpotlight";
import Features from "../components/Landingpage/Features";
import StepsTimeline from "../components/Landingpage/StepsTimeline";
import Faq from "../components/Landingpage/Faq";

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
        </>
      )}
    </>
  );
}

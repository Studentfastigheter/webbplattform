"use client";

import ScrollShowcase from "./components/Home/ScrollShowcase";
import ProductSpotlight from "./components/Home/ProductSpotlight";
import Features from "./components/Home/Features";
import StepsTimeline from "./components/Home/StepsTimeline";
import Faq from "./components/Home/Faq";

export default function HomePage() {

  return (
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
  );
}

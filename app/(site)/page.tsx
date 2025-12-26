"use client";

import ScrollShowcase from "../../components/Landingpage/ScrollShowcase";
import ProductSpotlight from "../../components/Landingpage/ProductSpotlight";
import Features from "../../components/Landingpage/Features";
import StepsTimeline from "../../components/Landingpage/StepsTimeline";
import Faq from "../../components/Landingpage/Faq";

export default function HomePage() {

  return (
  <>
    <ScrollShowcase />
    <ProductSpotlight />
    <Features />
    <StepsTimeline />
    <Faq />
  </>
  );
}

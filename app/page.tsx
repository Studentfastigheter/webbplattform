"use client";

import { useAuth } from "@/context/AuthContext";
import ScrollShowcase from "../components/Landingpage/ScrollShowcase";
import ProductSpotlight from "../components/Landingpage/ProductSpotlight";
import Features from "../components/Landingpage/Features";
import StepsTimeline from "../components/Landingpage/StepsTimeline";
import Faq from "../components/Landingpage/Faq";
import ListingCard_Small from "@/components/Listings/ListingCard_Small";
import Que_ListingCard from "@/components/Listings/Que_ListingCard";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      {!user && (
        <>
          <ScrollShowcase />
          <ProductSpotlight />
          <Features />
          <StepsTimeline />
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

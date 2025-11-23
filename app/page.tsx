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
          <div className="min-h-screen bg-gray-100 p-10">         
            <ListingCard_Small
              title="1:a Vasagatan 19"
              area="Innerstan"
              city="Göteborg"
              dwellingType="Lägenhet"
              rooms={3}
              sizeM2={42}
              rent={3800}
              landlordType="Privat värd"
              isVerified={true}
              imageUrl="/appartment.jpg"
              tags={["Möblerat", "Poängfri", "Diskmaskin"]}
              onClick={() => alert("Klick!")}
            />
            
            <Que_ListingCard
              name="SGS Studentbostäder"
              area="Innerstan"
              city="Göteborg"
              totalUnits={900}
              isVerified={true}
              logoUrl="/logos/sgs-logo.svg"
              tags={["Kristet", "Korridorer", "Lägenheter"]}
              onViewListings={() => console.log("Visa bostäder")}
              onReadMore={() => console.log("Läs mer")}
            />
          </div>
        </>
      )}
    </>
  );
}

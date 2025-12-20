"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import ProfileHero, { type StudentProfileExtended } from "@/components/profile/ProfileHero";
import ProfileHeroActions from "@/components/profile/ProfileHeroActions";
import ProfileAbout from "@/components/profile/ProfileAbout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { schoolService } from "@/services/school-service";
import { listingService } from "@/services/listing-service";
import {
  type School,
  type User,
} from "@/types";
import { MapPin } from "lucide-react";

/**
 * Mappar User (Backend) till StudentProfileExtended (UI)
 */
const buildProfileFromUser = (user: User): StudentProfileExtended => {
  const fullName = user.displayName || `${user.firstName || ""} ${user.surname || ""}`.trim() || user.email;

  return {
    ...user,
    displayName: fullName,
    headline: user.city ?? "Student",
    stats: {
      studyProgram: user.tags?.[0] || "Ej angivet",
      studyPace: "100%",
      preferredArea: user.city ?? undefined,
    },
    bannerImage: user.bannerUrl ?? "/appartment.jpg",
    avatarUrl: user.logoUrl ?? "/logos/campuslyan-logo.svg",
    likedListings: [],
    listingApplications: [],
    queueApplications: [],
    searchWatchlist: [],
  } as unknown as StudentProfileExtended;
};

function LandlordProfileHero({ landlord, listingsCount }: { landlord: User; listingsCount: number }) {
  const displayName = landlord.fullName || landlord.displayName || landlord.email;
  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-lg">
      <div className="relative h-48 w-full bg-gray-100">
        <Image src={landlord.bannerUrl ?? "/appartment.jpg"} alt={displayName} fill className="object-cover" priority />
      </div>
      <div className="relative z-10 px-6 pb-6 pt-0 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between -mt-12">
          <div className="flex items-end gap-4">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
              <Image src={landlord.logoUrl ?? "/logos/campuslyan-logo.svg"} alt={displayName} fill className="object-cover" />
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" /> {landlord.city || "Sverige"}
              </p>
            </div>
          </div>
          <div className="pb-2">
            <ProfileHeroActions editHref="/installningar" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const router = useRouter();
  const { user, token } = useAuth(); // Nu inkluderas token
  const [landlordListings, setLandlordListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    // Endast för hyresvärdar
    if (!token || user?.accountType !== "private_landlord") return;

    setLoadingListings(true);
    
    // FIX: Anropa med siffer-argument (page=0, size=100) för att matcha listingService.getAll
    listingService.getAll(0, 100) 
      .then((res) => {
        // Spring Boot Page-objektet har datan i .content
        const items = res.content || [];
        // Filtrera fram annonser som tillhör den inloggade hyresvärden
        setLandlordListings(items.filter((l: any) => l.landlordId === user.id));
      })
      .catch(err => console.error("Misslyckades att hämta annonser", err))
      .finally(() => setLoadingListings(false));
  }, [token, user]);

  if (!user) return <div className="p-10 text-center text-muted-foreground">Logga in för att se profil.</div>;

  if (user.accountType === "student") {
    const profile = buildProfileFromUser(user);
    return (
      <main className="max-w-7xl mx-auto p-4 lg:p-10 space-y-8">
        <ProfileHero student={profile} />
        <ProfileAbout
          aboutText={user.description || "Ingen beskrivning angiven."}
          facts={[
            { label: "Skola", value: user.schoolName || "Ej angivet" },
            { label: "Stad", value: user.city || "Ej angivet" }
          ]}
        />
      </main>
    );
  }

  if (user.accountType === "private_landlord") {
    return (
      <main className="max-w-7xl mx-auto p-4 lg:p-10 space-y-8">
        <LandlordProfileHero landlord={user} listingsCount={landlordListings.length} />
        <section className="bg-white/80 rounded-3xl p-6 border border-black/5 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Mina annonser</h2>
            <Button onClick={() => router.push("/mina-annonser/ny")}>Skapa annons</Button>
          </div>
          {loadingListings ? (
            <p>Laddar...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {landlordListings.map(l => (
                <ListingCardSmall 
                  key={l.listingId} 
                  title={l.title} 
                  city={l.city || ""} 
                  // FIX: Lägg till alla obligatoriska props som komponenten kräver
                  area={l.area || "Ej angivet"}
                  dwellingType={l.dwellingType || "Bostad"}
                  rooms={l.rooms || 0}
                  sizeM2={l.sizeM2 || 0}
                  rent={l.rent || 0}
                  imageUrl={l.imageUrl || (l.images && l.images[0]?.imageUrl)}
                  landlordType="Privat värd"
                  onClick={() => router.push(`/bostader/${l.listingId}`)} 
                />
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  return null;
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import QueueRules from "@/components/ads/QueueRules";
import { queueService } from "@/services/queue-service";
import { listingService } from "@/services/listing-service";
import { useAuth } from "@/context/AuthContext";
import { type ListingCardSmallProps } from "@/components/Listings/ListingCard_Small";
import { type HousingQueueDTO } from "@/types/queue";

const DEFAULT_RULES = [
  { title: "Studiekrav", description: "Antagen på minst 15 hp per termin." },
  { title: "Aktivt konto", description: "Profil och kontaktuppgifter ska vara uppdaterade." },
  { title: "Svarstid", description: "Svarstid 1-2 dagar på erbjudanden." },
];

const toListingCard = (listing: any): ListingCardSmallProps => ({
  title: listing.title,
  area: "", 
  city: listing.city || "Okänd ort",
  dwellingType: "", 
  rooms: listing.rooms ?? undefined,
  sizeM2: listing.sizeM2 ?? undefined,
  rent: listing.rent ?? undefined,
  landlordType: listing.hostType,
  isVerified: true,
  imageUrl: listing.listingImage ?? undefined, // Matchar din backend DTO
  tags: [],
});

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const queueId = params?.id;
  const router = useRouter();
  const { user } = useAuth();

  const [queue, setQueue] = useState<HousingQueueDTO | null>(null);
  const [listings, setListings] = useState<ListingCardSmallProps[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let active = true;
    if (!queueId) return;
    setLoading(true);

    Promise.all([
      queueService.get(queueId),
      listingService.getAll(0, 100)
    ])
      .then(([foundQueue, listingRes]) => {
        if (!active) return;
        
        if (!foundQueue) {
          setError("Kön hittades inte.");
          return;
        }
        setQueue(foundQueue);

        // Säker hantering av PageResponse oavsett om det är .content eller .items
        const listingsArray = Array.isArray(listingRes) 
          ? listingRes 
          : (listingRes as any).content || (listingRes as any).items || [];
        
        // Filtrera annonser som tillhör just detta företag
        const filtered = listingsArray
          .filter((l: any) => 
            l.hostType === "Företag" && 
            l.companyId === foundQueue.companyId
          )
          .map(toListingCard);
        
        setListings(filtered);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Fetch error:", err);
        setError("Kunde inte ladda köuppgifter.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => { active = false; };
  }, [queueId]);

  const handleJoinQueue = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!queueId) return;

    setJoining(true);
    try {
      await queueService.join(queueId);
      alert(`Du står nu i kön för ${queue?.name}!`);
    } catch (err: any) {
      alert(err.message || "Kunde inte gå med i kön. Kanske står du redan i den?");
    } finally {
      setJoining(false);
    }
  };

  const content = useMemo(() => {
    if (loading) return <div className="py-20 text-center text-gray-500 italic">Hämtar information om kön...</div>;
    if (error || !queue) return <div className="py-20 text-center text-red-500 font-medium">{error || "Kön hittades inte."}</div>;

    return (
      <div className="space-y-12">
        <QueueHero 
          queue={queue} 
          onJoin={handleJoinQueue} 
          isJoining={joining} 
          isLoggedIn={!!user}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">
              Lediga bostäder hos {queue.name}
            </h2>
            {listings.length > 0 ? (
              <QueueListings listings={listings} />
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border border-dashed border-gray-300">
                Det finns inga lediga bostäder publicerade i denna kö just nu.
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Köregler</h2>
            <div className="bg-white rounded-xl shadow-sm border p-2">
              <QueueRules rules={DEFAULT_RULES} />
            </div>
          </div>
        </div>
      </div>
    );
  }, [error, listings, loading, queue, joining, user]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      {content}
    </main>
  );
}
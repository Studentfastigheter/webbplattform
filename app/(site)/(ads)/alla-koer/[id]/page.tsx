"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import { queueService } from "@/services/queue-service";
import { listingService } from "@/services/listing-service";
import { useAuth } from "@/context/AuthContext";
import { type ListingCardDTO } from "@/types/listing";
import { type HousingQueueDTO } from "@/types/queue";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Dummy data ─── Byt USE_DUMMY till false för att använda API ───
const USE_DUMMY = true;

const DUMMY_QUEUE: HousingQueueDTO = {
  id: "dummy-queue-1",
  companyId: 1001,
  name: "Lyans Studentbostäder",
  city: "Linköping",
  logoUrl: "https://img.meccdn.com/media/logo_160_221229234541708565.jpg",
  bannerUrl: "https://sumfinity.com/wp-content/uploads/2014/07/Prague-Panorama-Golden-River.jpg",
  description:
    "Lyans Studentbostäder erbjuder moderna och prisvärda bostäder för studenter i Linköping. " +
    "Vi har lägenheter nära campus med bra kommunikationer och trivsamma gemensamma ytor. " +
    "Alla våra bostäder har snabbt internet, tvättstuga i huset och tillgång till cykelförråd. " +
    "Vi strävar efter att göra din studietid så bekväm som möjligt!",
  tags: ["Studentbostad", "Nära campus", "Möblerat", "Internet ingår"],
  totalUnits: 342,
  waitDays: 180,
  activeListings: 5,
  contactPhone: "013-123 45 67",
  contactEmail: "info@lyans-studentbostader.se",
  website: "https://lyans-studentbostader.se",
  socialLinks: {
    facebook: "https://facebook.com/lyans",
    linkedin: "https://linkedin.com/company/lyans",
  },
};

const DUMMY_LISTINGS: ListingCardDTO[] = [
  {
    id: "listing-1",
    imageUrl: "https://www.thebrick.se/wp-content/uploads/2024/04/CBILD5H23CUCLUH8S08EK.webp",
    title: "Ettan på Ryd",
    location: "Ryd, Linköping",
    rent: 4200,
    dwellingType: "Lägenhet",
    rooms: 1,
    sizeM2: 28,
    tags: ["Möblerat", "Internet ingår"],
    hostType: "Företag",
    verifiedHost: true,
  },
  {
    id: "listing-2",
    imageUrl: "https://www.thebrick.se/wp-content/uploads/2024/04/CBILD5H23CUCLUH8S08EK.webp",
    title: "Tvåa med balkong, Irrblosset",
    location: "Irrblosset, Linköping",
    rent: 5800,
    dwellingType: "Lägenhet",
    rooms: 2,
    sizeM2: 45,
    tags: ["Balkong", "Renoverat"],
    hostType: "Företag",
    verifiedHost: true,
  },
  {
    id: "listing-3",
    imageUrl: "https://www.thebrick.se/wp-content/uploads/2024/04/CBILD5H23CUCLUH8S08EK.webp",
    title: "Korridor på Flamman",
    location: "Flamman, Linköping",
    rent: 3400,
    dwellingType: "Korridorsrum",
    rooms: 1,
    sizeM2: 18,
    tags: ["Studentbostad", "Nära campus"],
    hostType: "Företag",
    verifiedHost: true,
  },
  {
    id: "listing-4",
    imageUrl: "https://www.thebrick.se/wp-content/uploads/2024/04/CBILD5H23CUCLUH8S08EK.webp",
    title: "Stor trea, Vallastaden",
    location: "Vallastaden, Linköping",
    rent: 7500,
    dwellingType: "Lägenhet",
    rooms: 3,
    sizeM2: 68,
    tags: ["Nybyggt", "Balkong", "Parkering"],
    hostType: "Företag",
    verifiedHost: true,
  },
  {
    id: "listing-5",
    imageUrl: "https://www.thebrick.se/wp-content/uploads/2024/04/CBILD5H23CUCLUH8S08EK.webp",
    title: "Etta vid T1",
    location: "T1, Linköping",
    rent: 4500,
    dwellingType: "Lägenhet",
    rooms: 1,
    sizeM2: 32,
    tags: ["Internet ingår", "Tvättstuga"],
    hostType: "Företag",
    verifiedHost: true,
  },
];
// ─── Slut dummy data ───

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const queueId = params?.id;
  const router = useRouter();
  const { user } = useAuth();

  const [queue, setQueue] = useState<HousingQueueDTO | null>(null);
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!queueId) return;

    // ── Dummy-läge: skippa API-anrop ──
    if (USE_DUMMY) {
      setQueue(DUMMY_QUEUE);
      setListings(DUMMY_LISTINGS);
      setLoading(false);
      return;
    }

    // ── API-läge ──
    let active = true;
    setLoading(true);

    Promise.all([
      queueService.get(queueId),
      listingService.getAll(0, 100),
    ])
      .then(([foundQueue, listingRes]) => {
        if (!active) return;

        if (!foundQueue) {
          setError("Kön hittades inte.");
          return;
        }
        setQueue(foundQueue);

        const listingsArray: ListingCardDTO[] = Array.isArray(listingRes)
          ? listingRes
          : (listingRes as any).content || (listingRes as any).items || [];

        const filtered = listingsArray.filter(
          (l) =>
            l.hostType === "Företag" &&
            (l as any).companyId === foundQueue.companyId
        );

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

    return () => {
      active = false;
    };
  }, [queueId]);

  const handleJoinQueue = async () => {
    if (!user) {
      router.push("/logga-in");
      return;
    }
    if (!queueId) return;

    setJoining(true);
    try {
      await queueService.join(queueId);
      alert(`Du står nu i kön för ${queue?.name}!`);
    } catch (err: any) {
      alert(
        err.message || "Kunde inte gå med i kön. Kanske står du redan i den?"
      );
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500 italic">
        Hämtar information om kön...
      </div>
    );
  }

  if (error || !queue) {
    return (
      <div className="py-20 text-center text-red-500 font-medium">
        {error || "Kön hittades inte."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white mx-12">
      {/* Hero: banner, logo, company info, about, notification */}
      <QueueHero queue={queue} />

      {/* Listings section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 pb-16">
        {listings.length > 0 ? (
          <QueueListings
            listings={listings}
            title={`Lediga bostäder hos ${queue.name}`}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            Det finns inga lediga bostäder publicerade just nu.
          </div>
        )}
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-lg px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {queue.name}
            </p>
            <p className="text-xs text-gray-500">
              Ställ dig i kön och bli notifierad
            </p>
          </div>
          <Button
            onClick={handleJoinQueue}
            disabled={joining}
            variant="default"
            size="sm"
            className="shrink-0"
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Går med...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                {user ? "Ställ dig i kön" : "Logga in"}
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}

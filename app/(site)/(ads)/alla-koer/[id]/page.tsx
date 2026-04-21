"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import { queueService, type CompanyDTO } from "@/services/queue-service";
import { useAuth } from "@/context/AuthContext";
import { type ListingCardDTO } from "@/types/listing";
import { type HousingQueueDTO } from "@/types/queue";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const companyIdRaw = params?.id;
  const router = useRouter();
  const { user } = useAuth();

  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [queues, setQueues] = useState<HousingQueueDTO[]>([]);
  const [listings, setListings] = useState<ListingCardDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!companyIdRaw) return;

    const companyId = Number(companyIdRaw);
    if (Number.isNaN(companyId)) {
      setError("Ogiltigt företags-ID.");
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    Promise.all([
      queueService.getCompany(companyId),
      queueService.getByCompany(companyId),
      queueService.getCompanyListings(companyId, 0, 6),
    ])
      .then(([companyData, companyQueues, companyListings]) => {
        if (!active) return;
        setCompany(companyData);
        setQueues(Array.isArray(companyQueues) ? companyQueues : []);
        setListings(Array.isArray(companyListings) ? companyListings : []);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Fetch error:", err);
        setError("Kunde inte ladda företagsinformation.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [companyIdRaw]);

  // Bygg ett HousingQueueDTO-liknande objekt från company-data för QueueHero
  const heroQueue: HousingQueueDTO = company
    ? {
        id: String(company.id),
        companyId: company.id,
        name: company.name,
        city: "",
        logoUrl: company.logoUrl,
        bannerUrl: company.bannerUrl,
        description: company.description,
        website: company.website,
        activeListings: listings.length,
        totalUnits: queues.reduce((sum, q) => sum + (q.totalUnits ?? 0), 0),
        waitDays:
          queues.length > 0
            ? Math.round(
                queues.reduce((sum, q) => sum + (q.waitDays ?? 0), 0) /
                  queues.length
              )
            : undefined,
      }
    : {
        // Placeholder medan data laddas — sidan renderas ändå
        id: companyIdRaw ?? "",
        companyId: 0,
        name: loading ? "Laddar..." : "Okänt företag",
        city: "",
        logoUrl: "",
        activeListings: 0,
      };

  const handleJoinQueue = async (queueId: string) => {
    if (!user) {
      router.push("/logga-in");
      return;
    }

    setJoining(true);
    try {
      await queueService.join(queueId);
      alert("Du står nu i kön!");
    } catch (err: any) {
      alert(
        err.message || "Kunde inte gå med i kön. Kanske står du redan i den?"
      );
    } finally {
      setJoining(false);
    }
  };

  if (error) {
    return (
      <div className="py-20 text-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <main className="container mx-auto min-h-screen max-w-6xl bg-white px-4 pb-12 pt-6 lg:pt-10">
      {/* Hero: banner, logo, company info, about */}
      <div className="w-full">
        <QueueHero queue={heroQueue} />
      </div>

      {/* Köer */}
      {queues.length > 0 && (
        <div className="mt-10 w-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Bostadsköer
          </h2>
          <div className="space-y-3">
            {queues.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{q.name}</p>
                  <p className="text-sm text-gray-500">
                    {q.city}
                    {q.waitDays != null && ` · ~${q.waitDays} dagars kötid`}
                    {q.totalUnits != null && ` · ${q.totalUnits} bostäder`}
                  </p>
                </div>
                <Button
                  onClick={() => handleJoinQueue(q.id)}
                  disabled={joining}
                  variant="default"
                  size="sm"
                  className="shrink-0"
                >
                  {joining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Bell className="h-4 w-4" />
                      {user ? "Ställ dig i kön" : "Logga in"}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings section */}
      <div className="mt-10 w-full pb-4">
        {listings.length > 0 ? (
          <QueueListings
            listings={listings}
            title={`Lediga bostäder hos ${company?.name ?? "företaget"}`}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
            Det finns inga lediga bostäder publicerade just nu.
          </div>
        )}
      </div>
    </main>
  );
}

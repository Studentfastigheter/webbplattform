"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ListingCard from "@/app/components/Listings/ListingCard";
import { Button } from "@heroui/button";
import { SectionBadge } from "@/components/ui/section-badge";

type Company = { id: number; name: string };
type Listing = {
  id: number;
  title: string;
  city: string;
  price: number;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  companyName?: string | null;
  distanceKm?: number | null;
  area?: number | null;
  rooms?: number | null;
  type?: string | null;
  availableFrom?: string | null;
  images?: string[];
};

export default function QueueDetailPage() {
  const params = useParams<{ id: string }>();
  const companyId = Number(params?.id);
  const { token, user } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const companies: Company[] = await fetch("/api/companies", { cache: "no-store" }).then((r) => r.json());
        if (!active) return;
        const found = companies.find((c) => c.id === companyId) || null;
        setCompany(found);
        const res = await fetch(`/api/listings?page=0&size=200`, { cache: "no-store" });
        const body = res.ok ? await res.json() : { items: [] };
        if (!active) return;
        setAllListings(body.items || []);
      } catch (e: any) {
        if (!active) return;
        setError(e.message || "Kunde inte ladda data");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [companyId]);

  const listings = useMemo(() => {
    if (!company) return [] as Listing[];
    return (allListings || []).filter((l) => (l.companyName || "").toLowerCase() === company.name.toLowerCase());
  }, [allListings, company]);

  const join = async () => {
    if (!token || !company) return;
    setJoining(true); setJoinMsg(null);
    try {
      const res = await fetch(`/api/queues/join?companyId=${company.id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      setJoinMsg("Du står nu i denna kö.");
    } catch (e: any) {
      setJoinMsg(e.message || "Kunde inte gå med i kön");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <main className="container-page"><section className="section">Laddar…</section></main>;
  if (error) return <main className="container-page"><section className="section text-destructive">{error}</section></main>;
  if (!company) return <main className="container-page"><section className="section">Kön hittades inte.</section></main>;

  return (
    <main className="container-page">
      <section className="section space-y-3">
        <Link href="/alla-koer" className="text-sm text-muted hover:text-primary">← Tillbaka till alla köer</Link>
        <div className="flex items-center justify-between">
          <div>
            <SectionBadge text="Bostadskö" />
            <h1 className="h1">{company.name}</h1>
          </div>
          {user && (
            <Button
              color="success"
              isDisabled={joining}
              isLoading={joining}
              onPress={join}
            >
              {joining ? "Lägger till…" : "Gå med i kön"}
            </Button>
          )}
        </div>
        {joinMsg && <div className="text-primary">{joinMsg}</div>}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="h2">Nuvarande annonser</h2>
            {listings.length === 0 ? (
              <div className="card subtle">Inga aktuella annonser för denna kö.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {listings.map((l) => (
                  <ListingCard key={l.id} l={l as any} />
                ))}
              </div>
            )}
          </div>
          <aside className="space-y-3">
            <h3 className="h3">Villkor</h3>
            <div className="card">
              <p className="text-sm text-muted">
                Specifika villkor för denna kö är ännu inte tillgängliga här. Kontakta bostadsbolaget eller vår kundservice för mer information.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

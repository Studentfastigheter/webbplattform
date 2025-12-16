"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import { useAuth } from "@/context/AuthContext";
import { backendApi } from "@/lib/api";
import { type ListingWithRelations } from "@/types";

export default function Page() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [listings, setListings] = useState<ListingWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPrivateLandlord = user?.type === "private_landlord";
  const landlordId = user?.type === "private_landlord" ? user.landlordId : null;

  useEffect(() => {
    if (!token || !isPrivateLandlord) {
      setListings([]);
      return;
    }

    let active = true;
    setLoading(true);
    backendApi.listings
      .list({ size: 200, secure: true }, token)
      .then((res) => {
        if (!active) return;
        const items = res.items ?? [];
        const filtered = items.filter(
          (listing) =>
            landlordId &&
            listing.listingType === "private" &&
            listing.landlordId === landlordId
        );
        setListings(filtered);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda dina annonser.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, isPrivateLandlord, landlordId]);

  const gridListings = useMemo(() => listings ?? [], [listings]);

  const listingGridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <main className="flex flex-col gap-6 pb-12 pt-6 lg:pt-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mina annonser</h1>
          <p className="text-sm text-gray-600">
            Hantera och granska dina aktiva och kommande annonser.
          </p>
        </div>
        {isPrivateLandlord && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => router.push("/mina-annonser/ny")}
          >
            Skapa ny annons
          </Button>
        )}
      </header>

      {!token && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Logga in for att se dina annonser.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!isPrivateLandlord && token && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Denna sida ar for hyresvardskonton.
        </div>
      )}

      <section>
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">Laddar annonser...</div>
        ) : gridListings.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {isPrivateLandlord ? "Du har inga annonser an." : "Ingen annons att visa just nu."}
          </div>
        ) : (
          <div className={listingGridClasses}>
            {gridListings.map((listing) => {
              const primaryImage =
                typeof listing.images?.[0] === "string"
                  ? (listing.images?.[0] as string)
                  : listing.images?.[0]?.imageUrl;

              return (
                <ListingCardSmall
                  key={listing.listingId}
                  title={listing.title}
                  area={listing.area ?? ""}
                  city={listing.city ?? ""}
                  dwellingType={listing.dwellingType ?? ""}
                  rooms={listing.rooms ?? undefined}
                  sizeM2={listing.sizeM2 ?? undefined}
                  rent={listing.rent ?? undefined}
                  landlordType={listing.advertiser?.displayName ?? "Hyresvard"}
                  isVerified={Boolean(listing.advertiser)}
                  imageUrl={primaryImage}
                  tags={listing.tags ?? undefined}
                  images={listing.images}
                  onClick={() => router.push(`/bostader/${listing.listingId}`)}
                  variant="default"
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

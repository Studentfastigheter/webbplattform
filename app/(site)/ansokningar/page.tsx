"use client";

import { useEffect, useMemo, useState } from "react";

import ListFrame, { type ListFrameColumn } from "@/components/layout/ListFrame";
import {
  buildListingApplicationRow,
  type ListingApplicationRowProps,
} from "@/components/Listings/ListingApplicationRow";
import { useAuth } from "@/context/AuthContext";
import { backendApi } from "@/lib/api";
import { type CompanyId } from "@/types";

export default function Page() {
  const columns: ListFrameColumn[] = [
    { id: "annons", label: "Annons", width: "2.6fr" },
    { id: "etikett", label: "Etikett", width: "1.4fr" },
    { id: "status", label: "Status", align: "center", width: "1.1fr" },
    { id: "ansokningsdag", label: "Ansokningsdag", align: "left", width: "1fr" },
    { id: "andra_anmalan", label: "Andra anmalan", align: "center", width: "1.1fr" },
  ];

  const { token } = useAuth();
  const [applications, setApplications] = useState<ListingApplicationRowProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setApplications([]);
      return;
    }

    let active = true;
    setLoading(true);
    backendApi.interests
      .mine(token)
      .then((interests) => {
        if (!active) return;
        const mapped = interests.map((interest) => ({
          listingId: interest.listingId,
          title: interest.title ?? "Okand annons",
          rent: interest.rent ?? undefined,
          area: null,
          city: interest.city ?? null,
          dwellingType: null,
          rooms: null,
          sizeM2: null,
          landlordType: interest.companyName ?? "Hyresvard",
          imageUrl: interest.primaryImageUrl ?? undefined,
          tags: [],
          images: interest.primaryImageUrl
            ? [{ imageId: 1, listingId: interest.listingId, imageUrl: interest.primaryImageUrl }]
            : [],
          advertiser: interest.companyName
            ? {
                type: "company" as const,
                id: 0 as CompanyId,
                displayName: interest.companyName,
                logoUrl: null,
                bannerUrl: null,
                phone: null,
                contactEmail: null,
                contactPhone: null,
                contactNote: null,
                rating: null,
                subtitle: null,
                description: null,
                website: null,
                city: interest.city ?? null,
              }
            : undefined,
          status: "Aktiv",
          applicationDate: interest.createdAt,
        }));
        setApplications(mapped);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda ansokningar.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const rows = useMemo(
    () => applications.map(buildListingApplicationRow),
    [applications]
  );

  return (
    <main className="flex justify-center p-6">
      <div className="w-full max-w-6xl">
        {!token && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Logga in for att se dina ansokningar.
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <ListFrame
          columns={columns}
          rows={rows}
          emptyState={
            <div className="py-16 text-center text-sm text-gray-400">
              {loading
                ? "Laddar ansokningar..."
                : token
                  ? "Inga ansokningar att visa just nu"
                  : "Du maste vara inloggad for att se dina ansokningar."}
            </div>
          }
        />
      </div>
    </main>
  );
}

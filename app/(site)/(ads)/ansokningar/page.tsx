"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ListFrame, { type ListFrameColumn } from "@/components/layout/ListFrame";
import {
  buildListingApplicationRow,
  type ListingApplicationRowProps,
} from "@/components/Listings/ListingApplicationRow";
import {
  buildStudentApplicationRow,
  type StudentApplicationRowProps,
} from "@/components/Applications/StudentApplicationRow";
import { useAuth } from "@/context/AuthContext";
// ÄNDRING: Importera listingService istället för backendApi
import { listingService } from "@/services/listing-service";
import { type CompanyId } from "@/types";

const STUDENT_COLUMNS: ListFrameColumn[] = [
  { id: "annons", label: "Annons", width: "2.6fr" },
  { id: "etikett", label: "Etikett", width: "1.4fr" },
  { id: "status", label: "Status", align: "center", width: "1.1fr" },
  { id: "ansokningsdag", label: "Ansökningsdag", align: "left", width: "1fr" },
  { id: "andra_anmalan", label: "Ändra anmälan", align: "center", width: "1.1fr" },
];

const LANDLORD_COLUMNS: ListFrameColumn[] = [
  { id: "student", label: "Student", width: "2.6fr" },
  { id: "annons", label: "Annons", width: "1.6fr" },
  { id: "status", label: "Status", align: "center", width: "1.1fr" },
  { id: "inkommen", label: "Inkommen", align: "left", width: "1fr" },
  { id: "hantera", label: "Åtgärder", align: "center", width: "1.1fr" },
];

export default function Page() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [studentApplications, setStudentApplications] = useState<ListingApplicationRowProps[]>([]);
  const [landlordApplications, setLandlordApplications] = useState<StudentApplicationRowProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudent = user?.type === "student";
  const isPrivateLandlord = user?.type === "private_landlord";

  useEffect(() => {
    setError(null);

    if (!token) {
      setStudentApplications([]);
      setLandlordApplications([]);
      return;
    }

    let active = true;

    const loadStudentApplications = () => {
      setLandlordApplications([]);
      setLoading(true);
      
      // ÄNDRING: Använd listingService.getMyInterests
      listingService
        .getMyInterests(token)
        .then((interests) => {
          if (!active) return;
          const mapped: ListingApplicationRowProps[] = interests.map(
            (interest): ListingApplicationRowProps => ({
              listingId: interest.listingId,
              title: interest.title ?? "Okänd annons",
              rent: interest.rent ?? undefined,
              area: null,
              city: interest.city ?? null,
              dwellingType: null,
              rooms: null,
              sizeM2: null,
              landlordType: interest.companyName ?? "Hyresvärd",
              imageUrl: interest.primaryImageUrl ?? undefined,
              tags: [],
              images: interest.primaryImageUrl
                ? [
                    { imageId: 1, listingId: interest.listingId, imageUrl: interest.primaryImageUrl },
                  ]
                : [],
              advertiser: interest.companyName
                ? {
                    type: "company",
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
              onOpen: () => router.push(`/bostader/${interest.listingId}`),
            })
          );
          setStudentApplications(mapped);
        })
        .catch((err: any) => {
          if (!active) return;
          setError(err?.message ?? "Kunde inte ladda ansökningar.");
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
        });
    };

    const loadLandlordApplications = () => {
      // TODO: Koppla på hyresvärdens ansöknings-feed när API finns.
      setStudentApplications([]);
      setLoading(false);
      setLandlordApplications([]);
    };

    if (isStudent) {
      loadStudentApplications();
    } else if (isPrivateLandlord) {
      loadLandlordApplications();
    } else {
      setStudentApplications([]);
      setLandlordApplications([]);
    }

    return () => {
      active = false;
    };
  }, [token, isStudent, isPrivateLandlord, router]);

  const studentRows = useMemo(
    () => studentApplications.map(buildListingApplicationRow),
    [studentApplications]
  );

  const landlordRows = useMemo(
    () => landlordApplications.map(buildStudentApplicationRow),
    [landlordApplications]
  );

  const rows = isPrivateLandlord ? landlordRows : studentRows;
  const columns = isPrivateLandlord ? LANDLORD_COLUMNS : STUDENT_COLUMNS;

  const emptyMessage = (() => {
    if (loading) return "Laddar ansökningar...";
    if (!token) return "Du måste vara inloggad för att se dina ansökningar.";
    if (isPrivateLandlord) return "Inga ansökningar till dina annonser än.";
    if (isStudent) return "Inga ansökningar att visa just nu";
    return "Denna vy stöder inte kontotypen än.";
  })();

  return (
    <main className="w-full py-6">
      <div className="w-full">
        {!token && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Logga in för att se dina ansökningar.
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
              {emptyMessage}
            </div>
          }
        />
      </div>
    </main>
  );
}
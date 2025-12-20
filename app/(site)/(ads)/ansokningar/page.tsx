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

export default function MyApplicationsPage() {
  const router = useRouter();
  
  // FIX 1: Vi hämtar inte 'token' härifrån, vi kollar bara om 'user' finns.
  const { user } = useAuth();

  const [studentApplications, setStudentApplications] = useState<ListingApplicationRowProps[]>([]);
  const [landlordApplications, setLandlordApplications] = useState<StudentApplicationRowProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FIX 2: Använd 'as any' för att komma åt properties som TS inte känner till än (accountType/type)
  const userAccountType = (user as any)?.accountType || (user as any)?.type;
  const isStudent = userAccountType === "student";
  const isPrivateLandlord = userAccountType === "private_landlord";

  useEffect(() => {
    setError(null);

    // FIX 1: Kolla om user saknas istället för token
    if (!user) {
      setStudentApplications([]);
      setLandlordApplications([]);
      return;
    }

    let active = true;

    const loadStudentApplications = () => {
      setLandlordApplications([]);
      setLoading(true);
      
      listingService
        .getMyApplications()
        .then((apps) => {
          if (!active) return;

          const mapped: ListingApplicationRowProps[] = apps.map(
            (app): ListingApplicationRowProps => ({
              listingId: app.listingId,
              title: app.listingTitle,
              rent: app.rent,
              area: null,
              city: app.city,
              dwellingType: null,
              rooms: null,
              sizeM2: null,
              landlordType: app.hostType,
              imageUrl: app.listingImage,
              tags: [],
              
              images: app.listingImage
                ? [
                    { 
                      imageId: 1, 
                      listingId: app.listingId,
                      imageUrl: app.listingImage 
                    } as any 
                  ]
                : [],

              advertiser: {
                  type: app.hostType === "Företag" ? "company" : "private_landlord",
                  id: 0 as CompanyId,
                  displayName: app.hostType,
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
                  city: app.city,
              },

              // FIX 3: Casting 'as any' löser typfelet med Status-strängen
              status: (app.status === 'submitted' ? 'Aktiv' : 
                       app.status === 'accepted' ? 'Godkänd' : 
                       app.status === 'rejected' ? 'Nekad' : 'Aktiv') as any,
              
              applicationDate: app.appliedAt, 

              onOpen: () => router.push(`/bostader/${app.listingId}`),
            })
          );
          setStudentApplications(mapped);
        })
        .catch((err: any) => {
          if (!active) return;
          console.error(err);
          setError("Kunde inte ladda ansökningar.");
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
        });
    };

    const loadLandlordApplications = () => {
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
  }, [user, isStudent, isPrivateLandlord, router]); // FIX: Bytte token mot user i dependency array

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
    if (!user) return "Du måste vara inloggad för att se dina ansökningar.";
    if (isPrivateLandlord) return "Inga ansökningar till dina annonser än.";
    if (isStudent) return "Du har inte sökt några bostäder än.";
    return "Denna vy stöder inte kontotypen än.";
  })();

  return (
    <main className="w-full py-6">
      <div className="w-full">
        {!user && (
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
"use client";

import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { queueService } from "@/services/queue-service";
import { type CompanyId } from "@/types";
import type { ListingDetailDTO, StudentApplicationDTO } from "@/types/listing";

const STUDENT_COLUMNS: ListFrameColumn[] = [
  { id: "annons", label: "Annons", width: "2.6fr" },
  { id: "etikett", label: "Etikett", width: "1.4fr" },
  { id: "status", label: "Status", align: "center", width: "1.1fr" },
  { id: "ansokningsdag", label: "Ansökningsdag", align: "left", width: "1fr" },
  { id: "atgarder", label: "Åtgärder", align: "center", width: "1.1fr" },
];

const LANDLORD_COLUMNS: ListFrameColumn[] = [
  { id: "student", label: "Student", width: "2.6fr" },
  { id: "annons", label: "Annons", width: "1.6fr" },
  { id: "status", label: "Status", align: "center", width: "1.1fr" },
  { id: "inkommen", label: "Inkommen", align: "left", width: "1fr" },
  { id: "hantera", label: "Åtgärder", align: "center", width: "1.1fr" },
];

function normalizeApplicationStatus(status: unknown) {
  return String(status ?? "").trim().toLowerCase();
}

function hasOfferStatus(status: unknown) {
  const normalized = normalizeApplicationStatus(status);
  return [
    "offer",
    "offered",
    "offer_sent",
    "offer_received",
    "offer_received_by_student",
    "offered_to_student",
    "erbjudande",
  ].includes(normalized);
}

function toStudentStatus(status: unknown): ListingApplicationRowProps["status"] {
  const normalized = normalizeApplicationStatus(status);

  if (["accepted", "accept", "offer_accepted"].includes(normalized)) return "Antagen";
  if (["rejected", "reject", "offer_rejected"].includes(normalized)) return "Nekad";
  if (hasOfferStatus(status)) return "Erbjudande";

  return "Under granskning";
}

function formatApplicationDate(value: unknown) {
  if (typeof value !== "string" || !value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("sv-SE");
}

function getAdvertiserType(ownerType?: string | null, hostType?: string | null) {
  const normalized = String(ownerType ?? hostType ?? "").toLowerCase();
  return normalized.includes("private") || normalized.includes("privat")
    ? "private_landlord"
    : "company";
}

function buildApplicationRow(
  app: StudentApplicationDTO & Record<string, any>,
  detail: ListingDetailDTO | null,
  actions: {
    processingOfferId: number | null;
    onOpen: (listingId: string) => void;
    onWithdraw: (applicationId: number, listingTitle: string) => void;
    onOfferAction: (
      applicationId: number,
      listingTitle: string,
      action: "accept" | "reject"
    ) => void;
  }
): ListingApplicationRowProps {
  const applicationId = Number(app.applicationId ?? app.id);
  const listingId = String(app.listingId ?? detail?.id ?? "");
  const title = detail?.title ?? app.listingTitle ?? "Annons";
  const imageUrl = detail?.imageUrls?.[0] ?? app.listingImage ?? "";
  const ownerType = detail?.ownerType ?? app.hostType;
  const ownerName = detail?.ownerName ?? app.hostType ?? "Hyresvärd";
  const hasOffer = Number.isFinite(applicationId) && hasOfferStatus(app.status);

  return {
    applicationId,
    listingId,
    title,
    rent: detail?.rent ?? app.rent,
    area: detail?.area ?? null,
    city: detail?.city ?? app.city ?? null,
    dwellingType: detail?.dwellingType ?? null,
    rooms: detail?.rooms ?? null,
    sizeM2: detail?.sizeM2 ?? null,
    landlordType: ownerName,
    imageUrl,
    tags: detail?.tags ?? [],
    images: imageUrl
      ? [
          {
            imageUrl,
          },
        ]
      : [],
    isVerified: detail?.verifiedOwner ?? false,
    advertiser: {
      type: getAdvertiserType(ownerType, app.hostType),
      id: (detail?.ownerId ?? 0) as CompanyId,
      displayName: ownerName,
      logoUrl: detail?.ownerLogoUrl ?? null,
      bannerUrl: null,
      phone: null,
      contactEmail: null,
      contactPhone: null,
      contactNote: detail?.provider ? `Förmedlas via ${detail.provider}` : null,
      rating: null,
      subtitle: null,
      description: null,
      website: null,
      city: detail?.city ?? app.city ?? null,
    },
    status: toStudentStatus(app.status),
    hasOffer,
    isProcessingOffer: actions.processingOfferId === applicationId,
    applicationDate: formatApplicationDate(app.appliedAt),
    onOpen: () => actions.onOpen(listingId),
    onWithdraw: () => actions.onWithdraw(applicationId, title),
    onAcceptOffer: hasOffer
      ? () => actions.onOfferAction(applicationId, title, "accept")
      : undefined,
    onRejectOffer: hasOffer
      ? () => actions.onOfferAction(applicationId, title, "reject")
      : undefined,
  };
}

export default function MyApplicationsPage() {
  const router = useRouter();
  
  // FIX 1: Vi hämtar inte 'token' härifrån, vi kollar bara om 'user' finns.
  const { user } = useAuth();

  const [studentApplications, setStudentApplications] = useState<ListingApplicationRowProps[]>([]);
  const [landlordApplications, setLandlordApplications] = useState<StudentApplicationRowProps[]>([]);
  const [myQueues, setMyQueues] = useState<{ queueId: string; queueName: string; queueDays: number; status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingOfferId, setProcessingOfferId] = useState<number | null>(null);

  // FIX 2: Använd 'as any' för att komma åt properties som TS inte känner till än (accountType/type)
  const userAccountType = (user as any)?.accountType || (user as any)?.type;
  const isStudent = userAccountType === "student";
  const isPrivateLandlord = userAccountType === "private_landlord";

  const [reloadKey, setReloadKey] = useState(0);

  const handleWithdraw = useCallback(async (applicationId: number, listingTitle: string) => {
    if (!confirm(`Vill du dra tillbaka din ansökan till "${listingTitle}"?`)) return;

    try {
      await listingService.withdrawApplication(applicationId);
      setReloadKey((k) => k + 1);
    } catch (err: any) {
      setError(err?.message ?? "Kunde inte dra tillbaka ansökan.");
    }
  }, []);

  const handleOfferAction = useCallback(
    async (
      applicationId: number,
      listingTitle: string,
      action: "accept" | "reject"
    ) => {
      const actionLabel = action === "accept" ? "acceptera" : "neka";
      if (!confirm(`Vill du ${actionLabel} erbjudandet för "${listingTitle}"?`)) {
        return;
      }

      setProcessingOfferId(applicationId);
      setStudentApplications((current) =>
        current.map((entry) =>
          Number(entry.applicationId) === applicationId
            ? { ...entry, isProcessingOffer: true }
            : entry
        )
      );
      setError(null);

      try {
        if (action === "accept") {
          await listingService.acceptOffer(applicationId);
        } else {
          await listingService.rejectOffer(applicationId);
        }
        setReloadKey((k) => k + 1);
      } catch (err: any) {
        setError(
          err?.message ??
            (action === "accept"
              ? "Kunde inte acceptera erbjudandet."
              : "Kunde inte neka erbjudandet.")
        );
      } finally {
        setProcessingOfferId(null);
        setStudentApplications((current) =>
          current.map((entry) =>
            Number(entry.applicationId) === applicationId
              ? { ...entry, isProcessingOffer: false }
              : entry
          )
        );
      }
    },
    []
  );

  useEffect(() => {
    setError(null);

    if (!user) {
      setStudentApplications([]);
      setLandlordApplications([]);
      return;
    }

    let active = true;

    const loadStudentApplications = () => {
      setLandlordApplications([]);
      setLoading(true);

      queueService
        .getMyQueues()
        .then((queues) => {
          if (!active) return;
          setMyQueues(
            queues
              .filter((queue) => queue.queueId != null)
              .map((queue) => ({
                queueId: String(queue.queueId),
                queueName: queue.queueName ?? "",
                queueDays: queue.queueDays ?? 0,
                status: queue.status ?? "active",
              }))
          );
        })
        .catch((err: any) => {
          if (!active) return;
          console.error("Kunde inte hämta köer:", err);
        });

      listingService
        .getMyApplications()
        .then(async (apps) => {
          if (!active) return;

          const listingDetails = await Promise.allSettled(
            apps.map((app: any) => {
              const listingId = String(app.listingId ?? "");
              return listingId ? listingService.get(listingId) : Promise.resolve(null);
            })
          );

          if (!active) return;

          const mapped: ListingApplicationRowProps[] = apps.map(
            (app: any, index): ListingApplicationRowProps => {
              const detailResult = listingDetails[index];
              const detail =
                detailResult?.status === "fulfilled" ? detailResult.value : null;
              const applicationId = Number(app.applicationId ?? app.id);
              const hasOffer =
                Number.isFinite(applicationId) && hasOfferStatus(app.status);

              return {
              applicationId,
              listingId: String(app.listingId ?? detail?.id ?? ""),
              title: detail?.title ?? app.listingTitle ?? "Annons",
              rent: detail?.rent ?? app.rent,
              area: detail?.area ?? null,
              city: detail?.city ?? app.city ?? null,
              dwellingType: detail?.dwellingType ?? null,
              rooms: detail?.rooms ?? null,
              sizeM2: detail?.sizeM2 ?? null,
              landlordType: detail?.ownerName ?? app.hostType,
              imageUrl: detail?.imageUrls?.[0] ?? app.listingImage ?? "",
              tags: detail?.tags ?? [],

              images: (detail?.imageUrls?.[0] ?? app.listingImage)
                ? [
                    {
                      imageId: 1,
                      listingId: String(app.listingId ?? detail?.id ?? ""),
                      imageUrl: detail?.imageUrls?.[0] ?? app.listingImage
                    } as any
                  ]
                : [],

              advertiser: {
                  type: app.hostType === "Företag" ? "company" : "private_landlord",
                  id: (detail?.ownerId ?? 0) as CompanyId,
                  displayName: detail?.ownerName ?? app.hostType ?? "Hyresvärd",
                  logoUrl: detail?.ownerLogoUrl ?? null,
                  bannerUrl: null,
                  phone: null,
                  contactEmail: null,
                  contactPhone: null,
                  contactNote: detail?.provider ? `Förmedlas via ${detail.provider}` : null,
                  rating: null,
                  subtitle: null,
                  description: null,
                  website: null,
                  city: detail?.city ?? app.city,
              },

              status: toStudentStatus(app.status),
              hasOffer,
              isProcessingOffer: processingOfferId === applicationId,

              applicationDate: formatApplicationDate(app.appliedAt),

              onOpen: () => router.push(`/bostader/${app.listingId ?? detail?.id}`),
              onWithdraw: () =>
                handleWithdraw(applicationId, detail?.title ?? app.listingTitle),
              onAcceptOffer: hasOffer
                ? () =>
                    handleOfferAction(
                      applicationId,
                      detail?.title ?? app.listingTitle,
                      "accept"
                    )
                : undefined,
              onRejectOffer: hasOffer
                ? () =>
                    handleOfferAction(
                      applicationId,
                      detail?.title ?? app.listingTitle,
                      "reject"
                    )
                : undefined,
            };
            }
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
  }, [
    user,
    isStudent,
    isPrivateLandlord,
    router,
    reloadKey,
    handleWithdraw,
    handleOfferAction,
  ]);

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
          className={clsx(
            "overflow-hidden rounded-xl border-gray-200 shadow-sm",
            "[&_header]:bg-gray-50/80 [&_header]:px-6 [&_header]:py-3",
            "[&_header_span]:text-xs [&_header_span]:font-semibold [&_header_span]:uppercase [&_header_span]:tracking-normal [&_header_span]:text-gray-500",
            "[&_div.mx-8]:mx-0 [&_div.mx-8]:bg-gray-200",
            "[&_div.divide-y]:divide-gray-100 [&_div.grid]:px-4 [&_div.grid]:py-5"
          )}
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

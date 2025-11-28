import ListFrame, { ListFrameColumn } from "@/components/layout/ListFrame";
import { buildListingApplicationRow } from "@/components/Listings/ListingApplicationRow";

export default function Page() {
  const columns: ListFrameColumn[] = [
    { id: "annons", label: "Annons", width: "2.6fr" },
    { id: "etikett", label: "Etikett", width: "1.4fr" },
    { id: "status", label: "Status", align: "center", width: "1.1fr" },
    { id: "ansokningsdag", label: "Ansokningsdag", align: "left", width: "1fr" },
    { id: "andra_anmalan", label: "Andra anmalan", align: "center", width: "1.1fr" },
  ];

  const rows = [
    buildListingApplicationRow({
      id: "vasagatan-1a",
      title: "1:a Vasagatan 19",
      rent: 3800,
      area: "Innerstan",
      city: "Göteborg",
      dwellingType: "Lägenhet",
      rooms: 3,
      sizeM2: 42,
      landlordType: "Privat hyresvärd",
      imageUrl: "/appartment.jpg",
      isVerified: true,
      tags: ["Möblerat", "Poängfri", "Korridor"],
      status: "Aktiv",
      applicationDate: "2025-06-03",
    }),
    buildListingApplicationRow({
      id: "vasagatan-1a2",
      title: "1:a Vasagatan 19",
      rent: 3800,
      area: "Innerstan",
      city: "Göteborg",
      dwellingType: "Lägenhet",
      rooms: 3,
      sizeM2: 42,
      landlordType: "Privat hyresvärd",
      imageUrl: "/appartment.jpg",
      isVerified: true,
      tags: ["Möblerat", "Poängfri", "Korridor"],
      status: "Under granskning",
      applicationDate: "2025-06-03",
    }),
  ];

  return (
    <main className="flex justify-center p-6">
      <ListFrame
        columns={columns}
        rows={rows}
        emptyState={
          <div className="py-16 text-center text-sm text-gray-400">
            Inga ansökningar att visa just nu
          </div>
        }
      />
    </main>
  );
}


import ListFrame, { ListFrameColumn } from "@/components/layout/ListFrame";
import { buildListingApplicationRow } from "@/components/Listings/ListingApplicationRow";
import { listingApplicationFixtures } from "@/lib/mockData";

export default function Page() {
  const columns: ListFrameColumn[] = [
    { id: "annons", label: "Annons", width: "2.6fr" },
    { id: "etikett", label: "Etikett", width: "1.4fr" },
    { id: "status", label: "Status", align: "center", width: "1.1fr" },
    { id: "ansokningsdag", label: "Ansokningsdag", align: "left", width: "1fr" },
    { id: "andra_anmalan", label: "Andra anmalan", align: "center", width: "1.1fr" },
  ];

  const rows = listingApplicationFixtures.map(buildListingApplicationRow);

  return (
    <main className="flex justify-center p-6">
      <ListFrame
        columns={columns}
        rows={rows}
        emptyState={
          <div className="py-16 text-center text-sm text-gray-400">
            Inga ansokningar att visa just nu
          </div>
        }
      />
    </main>
  );
}

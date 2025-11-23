import ListFrame, { ListFrameColumn } from "@/components/layout/ListFrame";
import { buildQueueRow } from "@/components/Queues/QueueRow";

export default function Page() {
  const columns: ListFrameColumn[] = [
    { id: "name", label: "Namn", width: "2.4fr" },
    { id: "city", label: "Stad", width: "1.6fr" },
    { id: "status", label: "Status", align: "center", width: "1.2fr" },
    { id: "days", label: "Dagar", align: "left", width: "1fr" },
    { id: "hantera", label: " ", align: "center", width: "1.1fr" },
  ];

  const rows = [
    buildQueueRow({
      id: "sgs-1",
      name: "SGS Studentbostader",
      logoUrl: "/logos/sgs-logo.svg",
      cities: ["Göteborg", "Borås"],
      status: "active",
      days: 213,
    }),
    buildQueueRow({
      id: "sgs-2",
      name: "SGS Studentbostader",
      logoUrl: "/logos/sgs-logo.svg",
      cities: ["Göteborg", "Borås"],
      status: "processing",
      days: 213,
    }),
  ];

  return (
    <main className="flex justify-center p-6">
      <ListFrame
        columns={columns}
        rows={rows}
        emptyState={
          <div className="py-16 text-center text-sm text-gray-400">
            Inga koer att visa just nu
          </div>
        }
      />
    </main>
  );
}

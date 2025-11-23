import ListFrame, { ListFrameColumn } from "@/components/layout/ListFrame";

export default function Page() {
  const columns: ListFrameColumn[] = [
    { id: "name", label: "Namn", width: "2fr", marginRight: 12 },
    { id: "city", label: "Stad", width: "1.4fr" },
    { id: "status", label: "Status", align: "center", width: "1fr" },
    { id: "days", label: "Dagar", align: "right", width: "0.8fr", marginRight: 10 },
    { id: "hantera", label: " ", align: "right", width: "0.8fr", marginRight: 10 },
  ];

  return (
    <main className="flex justify-center p-6">
      <ListFrame
        columns={columns}
        emptyState={
          <div className="py-16 text-center text-sm text-gray-400">
            Inga köer att visa just nu
          </div>
        }
      />
    </main>
  );
}
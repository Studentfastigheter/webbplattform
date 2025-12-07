"use client";

import { useEffect, useMemo, useState } from "react";

import ListFrame, { type ListFrameColumn } from "@/components/layout/ListFrame";
import { buildQueueRow, type QueueRowProps } from "@/components/Queues/QueueRow";
import { backendApi } from "@/lib/api";

const statusToRowStatus = (status?: string): QueueRowProps["status"] => {
  if (status === "open") return "Aktiv";
  if (status === "paused") return "Bearbetas";
  return "Inaktiv";
};

export default function Page() {
  const columns: ListFrameColumn[] = [
    { id: "name", label: "Namn", width: "2.4fr" },
    { id: "city", label: "Stad", width: "1.6fr" },
    { id: "status", label: "Status", align: "center", width: "1.2fr" },
    { id: "days", label: "Dagar", align: "left", width: "1fr" },
    { id: "hantera", label: " ", align: "center", width: "1.1fr" },
  ];

  const [queueRows, setQueueRows] = useState<QueueRowProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    backendApi.queues
      .list()
      .then((queues) => {
        if (!active) return;
        const rows = queues.map((queue) => ({
          id: queue.queueId,
          name: queue.name,
          logoUrl:
            queue.company?.logoUrl ?? queue.company?.bannerUrl ?? "/logos/campuslyan-logo.svg",
          cities: queue.city ? [queue.city] : [],
          status: statusToRowStatus(queue.status),
          days: queue.approximateWaitDays ?? 0,
          onManage: () => {},
        }));
        setQueueRows(rows);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda kor.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => queueRows.map(buildQueueRow), [queueRows]);

  return (
    <main className="flex justify-center p-6">
      <div className="w-full max-w-5xl">
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
              {loading ? "Laddar kor..." : "Inga kor att visa just nu"}
            </div>
          }
        />
      </div>
    </main>
  );
}

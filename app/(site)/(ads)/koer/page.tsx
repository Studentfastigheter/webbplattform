"use client";

import { useEffect, useMemo, useState } from "react";

import ListFrame, { type ListFrameColumn } from "@/components/layout/ListFrame";
import { buildQueueRow, type QueueRowProps } from "@/components/Queues/QueueRow";
import { useAuth } from "@/context/AuthContext";
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

  const { token } = useAuth();
  const [queueRows, setQueueRows] = useState<QueueRowProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setQueueRows([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([backendApi.queues.mine(token), backendApi.queues.list()])
      .then(([userQueues, allQueues]) => {
        if (!active) return;
        const queueById = new Map(allQueues.map((queue) => [queue.queueId, queue]));
        const rows = userQueues.map((entry) => {
          const queue = queueById.get(entry.queueId);
          const company = queue?.company;
          return {
            id: entry.queueId,
            name: queue?.name ?? entry.queueName ?? "Okand ko",
            logoUrl: company?.logoUrl ?? company?.bannerUrl ?? "/logos/campuslyan-logo.svg",
            cities: queue?.city ? [queue.city] : [],
            status: statusToRowStatus(queue?.status),
            days: entry.queueDays ?? 0,
            onManage: () => {},
          };
        });
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
  }, [token]);

  const rows = useMemo(() => queueRows.map(buildQueueRow), [queueRows]);

  return (
    <main className="w-full py-6">
      <div className="w-full">
        {!token && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Logga in for att se dina kor.
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
                ? "Laddar kor..."
                : token
                  ? "Inga kor att visa just nu"
                  : "Du maste vara inloggad for att se dina kor."}
            </div>
          }
        />
      </div>
    </main>
  );
}

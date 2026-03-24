"use client";

import { useEffect, useMemo, useState } from "react";
import ListFrame, { type ListFrameColumn } from "@/components/layout/ListFrame";
import { buildQueueRow, type QueueRowProps } from "@/components/Queues/QueueRow";
import { useAuth } from "@/context/AuthContext";
import { queueService } from "@/services/queue-service";
import { type HousingQueueDTO } from "@/types/queue";

const statusToRowStatus = (status?: string): QueueRowProps["status"] => {
  // HousingQueueDTO använder oftast 'open' som standard
  if (status === "open") return "Aktiv";
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

  const { user } = useAuth(); // Använd user för att se om vi är inloggade
  const [queueRows, setQueueRows] = useState<QueueRowProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setQueueRows([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    // Hämta både användarens specifika köansökningar och alla tillgängliga köer
    Promise.all([queueService.getMyQueues(), queueService.list()])
      .then(([userApplications, allQueues]) => {
        if (!active) return;
        
        // Skapa en Map för snabb uppslagning av kö-detaljer baserat på ID
        const queueMap = new Map<string, HousingQueueDTO>(
          allQueues.map((q) => [q.id, q])
        );
        
        const rows = userApplications.map((app) => {
          const queueInfo = queueMap.get(app.queueId);
          
          return {
            id: app.queueId,
            name: queueInfo?.name ?? "Okänd kö",
            logoUrl: queueInfo?.logoUrl ?? "/logos/campuslyan-logo.svg",
            cities: queueInfo?.city ? [queueInfo.city] : [],
            status: statusToRowStatus("open"), // Du kan styra detta via app.status om det finns
            days: app.daysInQueue ?? 0, // Mappa mot rätt fält från din backend-DTO
            onManage: () => {
              // Exempel: navigera till köns detaljsida
              window.location.href = `/alla-koer/${app.queueId}`;
            },
          };
        });
        setQueueRows(rows);
      })
      .catch((err: any) => {
        if (!active) return;
        console.error(err);
        setError("Kunde inte ladda dina köer.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const rows = useMemo(() => queueRows.map(buildQueueRow), [queueRows]);

  return (
    <main className="w-full py-6">
      <div className="w-full">
        {!user && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Logga in för att se dina köer.
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
                ? "Laddar dina köplatser..."
                : user
                ? "Du står inte i några bostadsköer än."
                : "Du måste vara inloggad för att se dina köer."}
            </div>
          }
        />
      </div>
    </main>
  );
}
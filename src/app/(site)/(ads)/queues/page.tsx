"use client";

import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "@/components/icons";
import ListFrame, { type ListFrameColumn } from "@/components/layout/ListFrame";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  buildQueueRow,
  QueueCard,
  type QueueRowProps,
} from "@/features/queues/components/QueueRow";
import { useAuth } from "@/context/AuthContext";
import { useLeaveQueue, useMyQueues } from "@/features/queues/hooks/useQueues";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { isVerifiedStudentAuthAccount } from "@/features/auth/lib/account-access";

const statusToRowStatus = (status?: string): QueueRowProps["status"] => {
  const normalized = status?.toLowerCase();
  if (normalized === "active" || normalized === "open") return "Aktiv";
  if (normalized === "offered") return "Erbjudande";
  return "Inaktiv";
};

export default function Page() {
  const router = useRouter();
  const { locale, localizedHref } = useI18n();
  const columns: ListFrameColumn[] = [
    { id: "name", label: localizedText(locale, "Kö", "Queue"), width: "2.7fr" },
    { id: "status", label: "Status", align: "center", width: "1.2fr" },
    { id: "days", label: localizedText(locale, "Kötid", "Queue time"), align: "left", width: "1.2fr" },
    { id: "hantera", label: localizedText(locale, "Hantera", "Manage"), align: "center", width: "1.1fr" },
  ];

  const { user, isLoading: authLoading } = useAuth();
  const canViewQueues = isVerifiedStudentAuthAccount(user);

  useEffect(() => {
    if (authLoading || canViewQueues) return;
    router.replace(user ? localizedHref("/account") : "/");
  }, [authLoading, canViewQueues, localizedHref, router, user]);

  // hydrated=true so we get queue + company info for the row rendering.
  const {
    data: userApplications,
    isLoading: loading,
    isError,
  } = useMyQueues({ hydrated: true });

  const leaveQueue = useLeaveQueue();
  const { confirm: confirmAction, confirmDialog } = useConfirmDialog();
  const [leavingQueueId, setLeavingQueueId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleLeave = useCallback(
    async (queueId: string, queueName: string) => {
      const shouldLeave = await confirmAction({
        title: localizedText(locale, "Lämna kön?", "Leave the queue?"),
        description: localizedText(
          locale,
          `Din köplats och kötid i "${queueName}" försvinner.`,
          `Your position and queue time in "${queueName}" will be lost.`
        ),
        confirmLabel: localizedText(locale, "Lämna kön", "Leave queue"),
        cancelLabel: localizedText(locale, "Avbryt", "Cancel"),
        destructive: true,
      });
      if (!shouldLeave) {
        return;
      }

      setLeavingQueueId(queueId);
      setActionError(null);
      try {
        await leaveQueue.mutateAsync(queueId);
      } catch (err) {
        setActionError(
          (err as Error)?.message ??
            localizedText(locale, "Kunde inte lämna kön.", "Could not leave the queue.")
        );
      } finally {
        setLeavingQueueId(null);
      }
    },
    [leaveQueue, locale, confirmAction]
  );

  const error =
    actionError ?? (isError ? "Kunde inte ladda dina köer." : null);

  const queueRows = useMemo<QueueRowProps[]>(() => {
    if (!user || !userApplications) return [];

    return userApplications
      .filter((app) => app.queueId != null)
      .map((app) => {
        const queueId = String(app.queueId);
        const queue = app.queue;
        const company = queue?.company;
        const rawCompanyId = company?.id ?? queue?.companyId;
        const companyId =
          rawCompanyId != null && Number.isFinite(Number(rawCompanyId))
            ? Number(rawCompanyId)
            : null;
        const name =
          app.queueName ??
          queue?.name ??
          localizedText(locale, "Okänd kö", "Unknown queue");

        return {
          id: queueId,
          name,
          logoUrl:
            queue?.companyLogoUrl ??
            queue?.logoUrl ??
            company?.logoUrl ??
            null,
          status: statusToRowStatus(app.status ?? queue?.status ?? undefined),
          days: app.queueDays ?? 0,
          companyProfileHref: localizedHref(
            companyId != null ? `/all-queues/${companyId}` : "/all-queues"
          ),
          onLeave: () => handleLeave(queueId, name),
          leaving: leavingQueueId === queueId,
        };
      });
  }, [user, userApplications, locale, localizedHref, handleLeave, leavingQueueId]);

  const rows = useMemo(() => queueRows.map(buildQueueRow), [queueRows]);
  const emptyState = (
    <div className="py-16 text-center text-sm text-gray-400">
      {loading
        ? localizedText(locale, "Laddar dina köplatser...", "Loading your queue positions...")
        : user
        ? localizedText(locale, "Du står inte i några bostadsköer än.", "You are not in any housing queues yet.")
        : localizedText(locale, "Du måste vara inloggad för att se dina köer.", "You must be logged in to view your queues.")}
    </div>
  );

  if (authLoading || !canViewQueues) {
    return (
      <main className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </main>
    );
  }

  return (
    <main className="w-full py-4 sm:py-6">
      <div className="w-full">
        {!user && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {localizedText(locale, "Logga in för att se dina köer.", "Log in to view your queues.")}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-1 xl:hidden">
          {queueRows.length > 0
            ? queueRows.map((queue) => <QueueCard key={queue.id} {...queue} />)
            : emptyState}
        </div>

        <ListFrame
          columns={columns}
          rows={rows}
          className={clsx(
            "hidden overflow-hidden rounded-xl border-gray-200 shadow-sm xl:block",
            "[&_header]:bg-gray-50/80 [&_header]:px-6 [&_header]:py-3",
            "[&_header_span]:text-xs [&_header_span]:font-semibold [&_header_span]:uppercase [&_header_span]:tracking-normal [&_header_span]:text-gray-500",
            "[&_[data-slot=list-frame-separator]]:mx-0 [&_[data-slot=list-frame-separator]]:bg-gray-200",
            "[&_div.divide-y]:divide-gray-100 [&_div.grid]:px-6 [&_div.grid]:py-4"
          )}
          emptyState={emptyState}
        />
      </div>
      {confirmDialog}
    </main>
  );
}

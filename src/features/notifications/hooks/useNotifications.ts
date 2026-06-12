"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/context/AuthContext";
import { isVerifiedStudentAuthAccount } from "@/features/auth/lib/account-access";
import { notificationService } from "@/features/notifications/services/notification-service";
import type { NotificationItem } from "@/types";

const STALE_30_SECONDS = 30_000;

/**
 * @param enabled - allow callers to disable the fetch even when the user is
 * logged in (e.g. when external data is supplied via props). Defaults to
 * true so the common case is just `useNotifications()`.
 */
export function useNotifications({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useAuth();
  return useQuery<NotificationItem[]>({
    queryKey: qk.notifications.list(),
    queryFn: () => notificationService.getAll(),
    enabled: enabled && isVerifiedStudentAuthAccount(user),
    staleTime: STALE_30_SECONDS,
    // Notifications benefit from focus-refetch — re-enable here only.
    refetchOnWindowFocus: true,
  });
}

/**
 * Mark a notification as read with optimistic update. Snapshot → patch in
 * place → on error restore. We do NOT invalidate on settle for the happy
 * path because the cache already reflects the new state and the endpoint
 * returns void — invalidation would be a wasted round-trip.
 *
 * If you ever want a follow-up sync (e.g. multi-device), add invalidation
 * here.
 */
export function useMarkNotificationRead() {
  const qc = useQueryClient();

  type Vars = number;
  type Ctx = { previous: NotificationItem[] | undefined };

  return useMutation<void, Error, Vars, Ctx>({
    mutationFn: (id) => notificationService.markAsRead(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.notifications.list() });
      const previous = qc.getQueryData<NotificationItem[]>(
        qk.notifications.list()
      );
      qc.setQueryData<NotificationItem[]>(
        qk.notifications.list(),
        (old = []) =>
          old.map((entry) =>
            entry.id === id ? { ...entry, opened: true } : entry
          )
      );
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(qk.notifications.list(), ctx.previous);
      }
    },
  });
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";

import { NotificationsFeed } from "@/features/notifications/components/notification-feed";
import { useAuth } from "@/context/AuthContext";
import { isVerifiedStudentAuthAccount } from "@/features/auth/lib/account-access";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function Page() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { locale, localizedHref } = useI18n();
  const canViewNotifications = isVerifiedStudentAuthAccount(user);

  useEffect(() => {
    if (authLoading || canViewNotifications) return;
    router.replace(user ? localizedHref("/account") : "/");
  }, [authLoading, canViewNotifications, localizedHref, router, user]);

  if (authLoading || !canViewNotifications) {
    return (
      <main className="flex min-h-[calc(100svh-7rem)] w-full flex-col py-4 sm:py-6" aria-busy="true">
        <Skeleton className="h-8 w-40 motion-reduce:animate-none" />
        <div className="mt-4 space-y-2" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`notification-skeleton-${index}`}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4"
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-full motion-reduce:animate-none" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2 motion-reduce:animate-none" />
                <Skeleton className="h-3 w-3/4 motion-reduce:animate-none" />
                <Skeleton className="h-3 w-24 motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100svh-7rem)] w-full flex-col py-4 sm:py-6">
      <h1 className="text-2xl font-semibold">
        {localizedText(locale, "Notiser", "Notifications")}
      </h1>

      <div className="mt-4 min-h-[420px] flex-1 overflow-hidden">
        <NotificationsFeed />
      </div>
    </main>
  );
}

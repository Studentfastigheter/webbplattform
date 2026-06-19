"use client";

import { useEffect } from "react";
import { Loader2 } from "@/components/icons";
import { useRouter } from "next/navigation";

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
      <main className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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

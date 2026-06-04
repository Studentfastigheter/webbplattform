"use client";

import { NotificationsFeed } from "@/features/notifications/components/notification-feed";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function Page() {
  const { locale } = useI18n();

  return (
    <main className="h-screen overflow-hidden py-6">
      <h1 className="text-2xl font-semibold">
        {localizedText(locale, "Notiser", "Notifications")}
      </h1>

      <div className="mt-4 h-[calc(80%)]">
        <NotificationsFeed />
      </div>
    </main>
  );
}

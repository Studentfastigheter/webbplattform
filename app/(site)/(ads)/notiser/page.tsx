import { NotificationsFeed } from "@/components/notifications/notification-feed";

export default function Page() {
  return (
    <main className="h-screen overflow-hidden py-6">
      <h1 className="text-2xl font-semibold">Notiser</h1>

      <div className="mt-4 h-[calc(80%)]">
        <NotificationsFeed />
      </div>
    </main>
  );
}

import { MessagesLayout } from "@/components/messages/messages-layout";

export default function Page() {
  return (
    <main className="h-screen overflow-hidden py-6">
      <h1 className="text-2xl font-semibold">Meddelanden</h1>

      <div className="mt-4 h-[calc(80%)]">
        <MessagesLayout />
      </div>
    </main>
  );
}

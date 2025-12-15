import { SettingsLayout } from "@/components/settings/settings-layout";

export default function Page() {
  return (
    <main className="h-screen overflow-hidden py-6">

      {/* Viktigt: Layouten får egen “sektionhöjd” under H1 */}
      <div className="mt-4 h-[calc(80%)]">
        <SettingsLayout />
      </div>
    </main>
  );
}

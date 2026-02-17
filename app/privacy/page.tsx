import { SectionBadge } from "@/components/ui/section-badge";
export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <main className="container-page">
      <section className="section">
        <SectionBadge text="Juridik" />
        <h1 className="h1 mb-4">Integritet</h1>
        <p className="text-muted">Här beskriver vi i korthet hur vi hanterar personuppgifter. En fullständig policy kan tillhandahållas på begäran.</p>
      </section>
    </main>
  );
}

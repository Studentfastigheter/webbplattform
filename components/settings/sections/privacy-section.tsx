export function PrivacySection() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Sekretess</h2>
        <p className="text-sm text-muted-foreground">
          Styr synlighet och integritetsinställningar.
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium">Profilens synlighet</div>
        <p className="text-sm text-muted-foreground">
          Välj vilka uppgifter som visas för andra.
        </p>
      </div>
    </div>
  );
}

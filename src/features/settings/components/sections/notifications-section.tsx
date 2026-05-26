export function NotificationsSection() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Påminnelser</h2>
        <p className="text-sm text-muted-foreground">
          Välj vilka notifieringar du vill få.
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium">E-postnotiser</div>
        <p className="text-sm text-muted-foreground">
          Notiser om nya relevanta annonser och uppdateringar.
        </p>
      </div>
    </div>
  );
}

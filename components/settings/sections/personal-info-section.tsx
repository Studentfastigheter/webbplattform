import { Button } from "@/components/ui/button";

export function PersonalInfoSection() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Personuppgifter</h2>
        <p className="text-sm text-muted-foreground">
          Uppdatera din profil och kontaktinformation.
        </p>
      </div>

      <div className="rounded-xl border">
        <Row title="Juridiskt namn" value="Simon Carlén" action="Redigera" />
        <Divider />
        <Row title="E-postadress" value="s***@gmail.com" action="Redigera" />
        <Divider />
        <Row title="Telefonnummer" value="Lägg till" action="Lägg till" />
        <Divider />
        <Row title="Hemadress" value="Lägg till" action="Lägg till" />
      </div>
    </div>
  );
}

function Row({
  title,
  value,
  action,
}: {
  title: string;
  value: string;
  action: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 p-4">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{value}</div>
      </div>
      <Button variant="text" className="text-sm font-medium hover:underline">{action}</Button>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-border" />;
}

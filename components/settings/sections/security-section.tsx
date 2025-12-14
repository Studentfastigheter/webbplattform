import { Button } from "@/components/ui/button";

export function SecuritySection() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Inloggning & säkerhet</h2>
        <p className="text-sm text-muted-foreground">
          Hantera lösenord, 2FA och aktiva sessioner.
        </p>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm font-medium">Lösenord</div>
        <p className="text-sm text-muted-foreground">
          Uppdatera ditt lösenord regelbundet för bättre säkerhet.
        </p>
        <Button 
        size="sm"
        className="mt-3 text-sm font-medium hover:underline">
          Byt lösenord
        </Button>
      </div>
    </div>
  );
}

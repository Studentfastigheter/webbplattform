import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plannedRoles = [
  {
    name: "Administratör",
    description: "Full åtkomst till företagets inställningar, användare och innehåll.",
  },
  {
    name: "Redaktör",
    description: "Kan skapa och uppdatera annonser samt arbeta i företagets profil.",
  },
  {
    name: "Granskare",
    description: "Kan läsa data, följa ansökningar och arbeta utan att ändra centrala inställningar.",
  },
];

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Konton och behörigheter</h1>
        <p className="max-w-3xl text-sm text-gray-600">
          Här kommer företag kunna bjuda in flera användare till samma konto och styra
          vilken åtkomst varje inloggning har i portalen.
        </p>
      </header>

      <Card className="border-dashed border-gray-300 bg-white">
        <CardHeader>
          <CardTitle>Funktionen implementeras snart</CardTitle>
          <CardDescription>
            Sidan är förberedd för framtida stöd för flera inloggningar per företag.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            Tanken är att ett företag ska kunna ha flera användare med separata roller,
            till exempel administratör, redaktör och granskare.
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {plannedRoles.map((role) => (
              <article
                key={role.name}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <h2 className="text-base font-semibold text-gray-900">{role.name}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {role.description}
                </p>
              </article>
            ))}
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            Inga konton kan administreras här ännu, men sidan finns nu på plats i portalen.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type ApplicationsMode = "interest" | "queue";

export default function Ansokningar({
  mode = "interest",
}: {
  mode?: ApplicationsMode;
}) {
  const title = mode === "queue" ? "Köansökningar" : "Intresseanmälningar";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      <section className="min-h-[420px] rounded-lg border border-gray-200 bg-white" />
    </div>
  );
}

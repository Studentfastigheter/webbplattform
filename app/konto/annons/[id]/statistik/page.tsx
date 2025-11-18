export default async function AnnonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Annons-ID: {id}</h1>
      <p className="text-gray-600">
        Detta är huvudvyn för statistik för annonsen.
      </p>
    </main>
  );
}
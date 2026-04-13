import AnnonsOverview from "@/app/(business_portal)/_pages/annonsOverview";


type AnnonsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnnonsPage({ params }: AnnonsPageProps) {
  const { id } = await params;

  return <AnnonsOverview id={id} />;
}

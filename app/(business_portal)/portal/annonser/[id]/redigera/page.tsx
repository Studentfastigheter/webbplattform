import Annons from "@/app/(business_portal)/_views/annons";

type AnnonsEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnnonsEditPage({ params }: AnnonsEditPageProps) {
  const { id } = await params;

  return <Annons id={id} />;
}

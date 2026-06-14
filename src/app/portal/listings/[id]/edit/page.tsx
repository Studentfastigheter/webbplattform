import ListingEditView from "./ListingEditView";

type ListingEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingEditPage({ params }: ListingEditPageProps) {
  const { id } = await params;

  return <ListingEditView id={id} />;
}

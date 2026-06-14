import ListingOverviewView from "./ListingOverviewView";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  return <ListingOverviewView id={id} />;
}

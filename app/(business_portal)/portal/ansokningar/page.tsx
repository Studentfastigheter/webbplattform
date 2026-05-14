import Ansokningar from "../../_views/ansokningar"



export default async function Applications({
  searchParams,
}: {
  searchParams?: Promise<{
    filter?: string | string[];
    listingId?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const filter = Array.isArray(resolvedSearchParams?.filter)
    ? resolvedSearchParams?.filter[0]
    : resolvedSearchParams?.filter;
  const listingId = Array.isArray(resolvedSearchParams?.listingId)
    ? resolvedSearchParams?.listingId[0]
    : resolvedSearchParams?.listingId;
  const mode = filter === "ko" ? "queue" : "interest";

  return (
    <Ansokningar listingId={listingId} mode={mode} />
  )

}

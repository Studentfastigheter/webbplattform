import Ansokningar from "../../_views/ansokningar"
import { redirect } from "next/navigation";
import { dashboardRelPath } from "../../_statics/variables";



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

  if (mode === "queue") {
    redirect(`${dashboardRelPath}/bostadsko`);
  }

  return (
    <Ansokningar listingId={listingId} />
  )

}

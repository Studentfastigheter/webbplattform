import { redirect } from "next/navigation";

import { dashboardRelPath } from "../_statics/variables";
import ApplicationsView from "./ApplicationsView";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    filter?: string | string[];
    listingId?: string | string[];
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const filter = Array.isArray(resolvedSearchParams?.filter)
    ? resolvedSearchParams.filter[0]
    : resolvedSearchParams?.filter;
  const listingId = Array.isArray(resolvedSearchParams?.listingId)
    ? resolvedSearchParams.listingId[0]
    : resolvedSearchParams?.listingId;

  if (filter === "ko") {
    redirect(`${dashboardRelPath}/housing-queue`);
  }

  return <ApplicationsView listingId={listingId} />;
}

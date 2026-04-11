import Ansokningar from "../../_pages/ansokningar"



export default async function Applications({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const filter = Array.isArray(resolvedSearchParams?.filter)
    ? resolvedSearchParams?.filter[0]
    : resolvedSearchParams?.filter;
  const mode = filter === "ko" ? "queue" : "interest";

  return (
    <Ansokningar mode={mode} />
  )

}

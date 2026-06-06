// Legacy Swedish route — superseded by /cities/[city] after the rename in
// branch working_main. Kept as a permanent redirect so external links and
// bookmarks (`/stader/<city>`) keep working until the file can be removed
// from git in a follow-up commit (`git rm` after this merge lands).
import { permanentRedirect } from "next/navigation";

type LegacyCityPageParams = Promise<{ stad: string }>;

export default async function LegacyCityRedirect({
  params,
}: {
  params: LegacyCityPageParams;
}) {
  const { stad } = await params;
  permanentRedirect(`/cities/${encodeURIComponent(stad)}`);
}

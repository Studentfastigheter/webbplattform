import { redirect } from "next/navigation";
import { dashboardRelPath } from "../../../_statics/variables";

export default function NyAnnonsPage() {
  redirect(`${dashboardRelPath}/annonser`);
}

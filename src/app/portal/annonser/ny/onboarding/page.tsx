import { dashboardRelPath } from "@/app/portal/_statics/variables";
import { redirect } from "next/navigation";

export default function OnboardingIndex() {
  redirect(dashboardRelPath + "/annonser");
}

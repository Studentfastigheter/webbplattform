import { dashboardRelPath } from "@/app/(business_portal)/_statics/variables";
import { redirect } from "next/navigation";

export default function OnboardingIndex() {
  redirect(dashboardRelPath + "/annonser/ny/onboarding/1");
}
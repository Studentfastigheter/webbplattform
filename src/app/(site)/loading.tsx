import { LoadingScreen } from "@/components/ui/loader";

/**
 * Fallback för innehållsytan mellan header och footer. Gör att navigering
 * inom sajten alltid byter vy direkt — även in i (ads)-gruppen, vars layout
 * måste renderas innan sidornas egna loading-skelett kan visas.
 */
export default function Loading() {
  return <LoadingScreen className="min-h-[60svh]" />;
}

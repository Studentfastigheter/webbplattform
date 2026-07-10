"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Nollställer scrollpositionen till toppen vid navigering till en ny URL.
 *
 * Next App Router återställer inte alltid scrollen tillförlitligt mellan sidor
 * som delar layout och streamar via loading.tsx (t.ex. /housing → /all-queues),
 * så man kan hamna kvar långt ned på nästa sida. Den här komponenten forcerar
 * toppen när pathname ändras, men:
 *  - hoppar över första renderingen (webbläsaren sköter initial laddning),
 *  - hoppar över bakåt/framåt (POP) så webbläsarens scroll-restore får styra,
 *  - hoppar över hash-länkar (#ankare ska bestämma scrollen).
 *
 * Ändrade query-parametrar (t.ex. paginering ?page=2) rör inte pathname och
 * triggar därför inte den här återställningen.
 */
export default function ScrollReset() {
  const pathname = usePathname();
  const isPopNavigation = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const handlePopState = () => {
      isPopNavigation.current = true;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isPopNavigation.current) {
      isPopNavigation.current = false;
      return;
    }

    if (typeof window !== "undefined" && window.location.hash) {
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

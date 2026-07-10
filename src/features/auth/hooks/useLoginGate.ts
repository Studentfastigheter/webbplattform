"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Gate för åtgärder som kräver inloggning (t.ex. att söka en bostad eller kö).
 * Anropa den returnerade funktionen precis innan åtgärden utförs: är besökaren
 * en bekräftat utloggad användare skickas hen till /login och funktionen
 * returnerar `false` (blockerad). Annars returneras `true` (tillåten).
 *
 * Villkoret är `!isLoading && !user`: en inloggad användare vars session
 * fortfarande verifieras (user === null medan isLoading) får aldrig bouncas.
 * För en utloggad besökare utan token blir isLoading false direkt, så fönstret
 * där en sökning skulle slippa igenom är i praktiken obefintligt.
 */
export function useLoginGate() {
  const router = useRouter();
  const { localizedHref } = useI18n();
  const { user, isLoading } = useAuth();

  return useCallback(() => {
    if (!isLoading && !user) {
      router.push(localizedHref("/login"));
      return false;
    }

    return true;
  }, [isLoading, user, router, localizedHref]);
}

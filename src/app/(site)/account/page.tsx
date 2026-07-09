"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AccountSettingsShell from "@/components/shadcn-studio/blocks/account-settings-01/account-settings-shell";
import { LoadingScreen } from "@/components/ui/loader";
import { useAuth } from "@/context/AuthContext";
import AccountDocumentsSection from "@/features/documents/components/AccountDocumentsSection";
import StudentInterestsSection from "@/features/students/components/StudentInterestsSection";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function Page() {
  const { locale } = useI18n();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || user) return;

    router.replace("/");
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <LoadingScreen
        label={localizedText(locale, "Skickar dig vidare...", "Redirecting you...")}
      />
    );
  }

  return (
    <main className="py-8">
      <AccountSettingsShell
        title={localizedText(locale, "Mitt konto", "My account")}
        description={localizedText(
          locale,
          "Hantera konto, verifiering, säkerhet och uppladdade dokument.",
          "Manage your account, verification, security and uploaded documents."
        )}
        showVerification
      >
        {user.accountType === "student" && <StudentInterestsSection />}
        <AccountDocumentsSection />
      </AccountSettingsShell>
    </main>
  );
}

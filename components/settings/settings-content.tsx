"use client";

import type { SettingsKey } from "./settings-sidebar";

import { PersonalInfoSection } from "./sections/personal-info-section";
import { SecuritySection } from "./sections/security-section";
import { PrivacySection } from "./sections/privacy-section";
import { NotificationsSection } from "./sections/notifications-section";

export function SettingsContent({ active }: { active: SettingsKey }) {
  switch (active) {
    case "personal":
      return <PersonalInfoSection />;
    case "security":
      return <SecuritySection />;
    case "privacy":
      return <PrivacySection />;
    case "notifications":
      return <NotificationsSection />;
    default:
      return null;
  }
}

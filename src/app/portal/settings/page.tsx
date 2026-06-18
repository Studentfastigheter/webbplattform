import AccountSettingsShell from "@/components/shadcn-studio/blocks/account-settings-01/account-settings-shell";
import { PortalPage } from "../_components/shared/PortalGrid";

export default function SettingsPage() {
  return (
    <PortalPage>
      <AccountSettingsShell
        generalOptions={{
          personalInfo: {
            showAvatar: false,
            showCity: false,
            showAbout: false,
          },
          showDangerZone: false,
        }}
      />
    </PortalPage>
  );
}

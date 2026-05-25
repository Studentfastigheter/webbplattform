import AccountSettingsShell from "@/components/shadcn-studio/blocks/account-settings-01/account-settings-shell";

export default function SettingsPage() {
  return (
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
  );
}

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LoginForm } from "@/components/ui/LoginForm";

export default function PortalLoginPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-[#f6f7f6] p-6 md:p-10">
      <LanguageSwitcher className="absolute right-4 top-4 h-11 w-11 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 hover:opacity-100 md:right-6 md:top-6" />

      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm mode="company" />
      </div>
    </main>
  );
}

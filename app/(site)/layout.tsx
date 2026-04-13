import SiteHeader from "@/components/SiteHeader/SiteHeader";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import OnboardingModal from "@/components/user-onbording/OnboardingModal";
import { SiteAccountGuard } from "@/components/auth/AccountRouteGuards";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteAccountGuard>
      <OnboardingModal />
      
      <SiteHeader />
      <main className="pt-20">
        {children}
      </main>
      <SiteFooter />
    </SiteAccountGuard>
  );
}

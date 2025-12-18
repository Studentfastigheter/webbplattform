import SiteHeader from "@/components/SiteHeader/SiteHeader";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
// 1. Importera modalen
import OnboardingModal from "@/components/user-onbording/OnboardingModal";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingModal />
      
      <SiteHeader />
      <main className="pt-20">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
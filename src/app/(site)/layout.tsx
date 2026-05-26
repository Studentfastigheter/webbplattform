import SiteHeader from "@/components/layout/site-header/SiteHeader";
import SiteFooter from "@/components/layout/site-footer/SiteFooter";
import { SiteAccountGuard } from "@/features/auth/components/AccountRouteGuards";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteAccountGuard>
      <SiteHeader />
      <main className="pt-20">
        {children}
      </main>
      <SiteFooter />
    </SiteAccountGuard>
  );
}

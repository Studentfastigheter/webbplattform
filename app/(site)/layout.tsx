import SiteHeader from "@/components/SiteHeader/SiteHeader";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { SiteAccountGuard } from "@/components/auth/AccountRouteGuards";

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

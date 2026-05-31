import SiteHeader from "@/components/layout/site-header/SiteHeader";
import SiteFooter from "@/components/layout/site-footer/SiteFooter";
import { SiteAccountGuard } from "@/features/auth/components/AccountRouteGuards";
import { isPlatformLaunched } from "@/lib/platform-launch";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      <SiteHeader />
      <main className="pt-20">
        {children}
      </main>
      <SiteFooter />
    </>
  );

  if (!isPlatformLaunched()) {
    return content;
  }

  return (
    <SiteAccountGuard>
      {content}
    </SiteAccountGuard>
  );
}

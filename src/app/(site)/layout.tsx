import SiteHeader from "@/components/layout/site-header/SiteHeader";
import SiteFooter from "@/components/layout/site-footer/SiteFooter";
import { SiteAccountGuard } from "@/features/auth/components/AccountRouteGuards";
import { isPlatformLaunched } from "@/lib/platform-launch";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <>
      {/* Skip-länk (WCAG 2.4.1): synlig först vid tangentbordsfokus. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1300] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Hoppa till innehållet
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="pt-20 focus:outline-none">
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

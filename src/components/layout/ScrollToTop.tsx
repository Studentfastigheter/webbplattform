"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "@/components/icons";
import { cn } from "@/lib/utils";
import { isAdminSubdomain, isPortalSubdomain } from "@/lib/subdomain-routing";

function isAppPath(pathname: string) {
  return (
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

export default function ScrollToTop() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const shouldHide =
    isPortalSubdomain() || isAdminSubdomain() || isAppPath(pathname);

  useEffect(() => {
    if (shouldHide) {
      setShowScrollTop(false);
      return;
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldHide]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (shouldHide || !showScrollTop) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex h-12 items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-4 text-zinc-900 shadow-xl outline-none backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-white dark:hover:bg-zinc-900",
        "group",
      )}
      aria-label="Scrolla till toppen"
    >
      <ArrowUp
        className="size-5 transition-transform duration-300 group-hover:-translate-y-1"
        strokeWidth={2.5}
      />
      <span className="pr-1 text-sm font-medium">Till toppen</span>
    </button>
  );
}

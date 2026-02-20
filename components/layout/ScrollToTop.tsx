"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!showScrollTop) return null;

  return (
    <button
      type="button"
      aria-label="Scrolla till toppen"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-[60]",
        "rounded-full bg-black px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-semibold text-white",
        "shadow-xl transition transform hover:-translate-y-1 hover:bg-gray-800 active:scale-95"
      )}
    >
      <span className="hidden sm:inline">Till toppen</span>
      <span className="sm:hidden">↑</span>
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-6 right-6 z-[60] flex items-center gap-2",
            "h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 px-4",
            "text-zinc-900 dark:text-white shadow-xl backdrop-blur-md",
            "border border-zinc-200 dark:border-zinc-800",
            "transition-colors hover:bg-white dark:hover:bg-zinc-900",
            "group outline-none" // Vi tar bort standard-outline helt här
          )}
          aria-label="Scrolla till toppen"
        >
          <ArrowUp 
            className="size-5 transition-transform duration-300 group-hover:-translate-y-1" 
            strokeWidth={2.5} 
          />
          <span className="text-sm font-medium pr-1">Till toppen</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = user ? [
    { href: "/listings", label: "Annonser" },
    { href: "/queues", label: "Köer" },
  ] : [
    { href: "/listings", label: "Annonser" },
    { href: "/register", label: "Registrera" },
    { href: "/login", label: "Logga in" },
  ];

  return (
    <header className="site-header">
      <div className="container-page h-16 flex items-center justify-between">
        
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/campuslyan-logo.svg"
            alt="CampusLyan"
            width={30}
            height={30}
          />
          <span className="font-semibold text-lg tracking-tight">CampusLyan</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden sm:flex items-center gap-8 text-[15px]">
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-brand font-medium border-b-2 border-brand pb-0.5"
                    : "text-foreground/80 hover:text-brand transition"
                }
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <>
              <span className="text-foreground/70">{user.email}</span>
              <button className="btn btn-outline" onClick={logout}>Logga ut</button>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden rounded-md px-2 py-1 hover:bg-gray-100 transition"
          aria-label="Öppna meny"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-2xl">☰</span>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="sm:hidden border-t border-border bg-white animate-slideDown">
          <nav className="container-page py-3 flex flex-col gap-3 text-[15px]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`${
                  pathname === link.href
                    ? "text-brand font-medium"
                    : "text-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button className="btn" onClick={() => { logout(); setOpen(false); }}>
                Logga ut
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Navbar,
  NavBody,
  NavItems,
  type NavbarItem,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

type NavItem = NavbarItem & { link: string };

export default function SiteHeader() {
  const { user, logout, ready } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const userType = user?.type; // "student" | "company" | "landlord" | undefined

  // --- Huvudnavigation beroende på typ ---

  let navItems: NavItem[] = [];

  if (!user) {
    // Utloggad
    navItems = [
      {
        name: "Bostäder",
        link: "/bostader",
      },
      {
        name: "Alla köer",
        link: "/alla-koer",
      },
      { name: "Kom igång", link: "/" },
    ];
  } else if (userType === "student") {
    navItems = [
      {
        name: "Bostäder",
        link: "/bostader",
        dropdown: [
          { name: "Sök bostäder", link: "/bostader" },
          { name: "Mina ansökningar", link: "/ansokningar" },
          { name: "Sparade", link: "/sparade" },
        ],
      },
      {
        name: "Alla köer",
        link: "/alla-koer",
        dropdown: [
          { name: "Lägg till köer", link: "/alla-koer" },
          { name: "Mina köer", link: "/koer" },
        ],
      },
      { name: "Meddelanden", link: "/meddelanden" },
    ];
  } else if (userType === "private_landlord") {
    navItems = [
      {
        name: "Skapa ny annons",
        link: "/konto/annons/ny",
      },
      {
        name: "Mina annonser",
        link: "/konto/mina-annonser",
        dropdown: [
          { name: "Alla annonser", link: "/konto/mina-annonser" },
          { name: "Publicerade", link: "/konto/mina-annonser?filter=active" },
          { name: "Arkiverade", link: "/konto/mina-annonser?filter=archived" },
        ],
      },
      {
        name: "Ansökningar",
        link: "/konto/annonser/ansokningar",
      },
    ];
  } else if (userType === "company") {
    navItems = [
      {
        name: "Dashboard",
        link: "/konto/foretag/dashboard",
      },
      {
        name: "Mina annonser",
        link: "/konto/foretag/annonser",
        dropdown: [
          { name: "Alla annonser", link: "/konto/foretag/annonser" },
          {
            name: "Kommande kampanjer",
            link: "/konto/foretag/annonser?view=campaigns",
          },
        ],
      },
      { name: "Ansökningshantering", link: "/konto/foretag/ansokningar" },
    ];
  } else {
    navItems = [{ name: "Bostadssök", link: "/bostader" }];
  }

  // Konto-menyn

  let accountMenuItems: NavItem[] = [];

  if (userType === "student") {
    accountMenuItems = [
      { name: "Mitt konto", link: "/konto" },
      { name: "Inställningar", link: "/konto/installningar" },
      { name: "Meddelanden", link: "/konto/meddelanden" },
    ];
  } else if (userType === "private_landlord") {
    accountMenuItems = [
      { name: "Mitt konto", link: "/konto" },
      { name: "Inställningar", link: "/konto/installningar" },
      { name: "Fakturering", link: "/konto/fakturering" },
    ];
  } else if (userType === "company") {
    accountMenuItems = [
      { name: "Företagsdashboard", link: "/konto/foretag/dashboard" },
      { name: "Hantera abonnemang", link: "/konto/foretag/abonnemang" },
      { name: "Fakturering", link: "/konto/foretag/fakturering" },
      { name: "Hantera profil", link: "/konto/foretag/profil" },
    ];
  } else if (user) {
    accountMenuItems = [{ name: "Mitt konto", link: "/konto" }];
  }

  const roleLabel =
    userType === "company"
      ? "Företag"
      : userType === "student"
      ? "Student"
      : userType === "private_landlord"
      ? "Privat uthyrare"
      : null;

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <Navbar className="top-4">
      <NavBody>
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004225] rounded-md hover:opacity-90 transition"
          aria-label="Gå till startsidan"
        >
          <Image
            src="/campuslyan-logo.svg"
            alt="CampusLyan"
            width={30}
            height={30}
            priority
          />

          <span className="text-base leading-tight">
            CampusLyan
          </span>
        </Link>

        {/* Desktop-nav med hover-dropdown */}
        <NavItems items={navItems} />

        <div className="hidden items-center gap-3 lg:flex">
          {!user && (
            <>
              <NavbarButton variant="secondary" href="/logga-in">
                Logga in
              </NavbarButton>
              <NavbarButton variant="primary" href="/registrera">
                Skapa konto
              </NavbarButton>
            </>
          )}

          {user && (
            <div className="relative flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm text-neutral-500">
                  {user.email}
                </span>
                {roleLabel && (
                  <span className="text-xs text-neutral-400">
                    {roleLabel}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                Konto ▾
              </button>
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-neutral-200 bg-white shadow-lg">
                  <div className="flex flex-col py-1">
                    {accountMenuItems.map((item) => (
                      <Link
                        key={item.link}
                        href={item.link}
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        {item.name}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-2 text-left text-sm text-red-600 hover:bg-neutral-50"
                    >
                      Logga ut
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/campuslyan-logo.svg"
              alt="CampusLyan"
              width={26}
              height={26}
            />
            <span className="text-sm font-semibold">CampusLyan</span>
          </Link>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item) => (
            <Link
              key={item.link ?? item.name}
              href={item.link ?? "#"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base text-neutral-700"
            >
              {item.name}
            </Link>
          ))}

          <div className="mt-4 flex w-full flex-col gap-3 border-t border-neutral-200 pt-3">
            {!user && (
              <>
                <NavbarButton
                  variant="secondary"
                  href="/logga-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Logga in
                </NavbarButton>
                <NavbarButton
                  variant="primary"
                  href="/registrera"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Skapa konto
                </NavbarButton>
              </>
            )}

            {user && (
              <>
                {accountMenuItems.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {accountMenuItems.map((item) => (
                      <Link
                        key={item.link}
                        href={item.link}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm text-neutral-700"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
                <NavbarButton variant="secondary" onClick={handleLogout}>
                  Logga ut
                </NavbarButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

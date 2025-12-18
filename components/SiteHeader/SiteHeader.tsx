"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

// Vi definierar vår egen typ som extendar NavbarItem för att inkludera 'link' som obligatorisk om vi vill
type NavItem = NavbarItem & { link?: string };

export default function SiteHeader() {
  // Använd 'isLoading' istället för 'ready' om du uppdaterade AuthContext enligt tidigare steg
  const { user, logout, isLoading } = useAuth(); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  // VIKTIGT: I dina typer heter fältet 'accountType', inte 'type'
  const userType = user?.accountType; 

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
      { name: "Notiser", link: "/notiser" },
    ];
  } else if (userType === "private_landlord" || userType === "company") {
    navItems = [
      {
        name: "Bostäder",
        link: "/bostader",
      },
      {
        name: "Mina annonser",
        link: "/mina-annonser",
        dropdown: [
          { name: "Skapa ny", link: "/mina-annonser/ny" },
          { name: "Mina annonser", link: "/mina-annonser" },
          { name: "Ansökningar", link: "/ansokningar" },
        ],
      },
      {
        name: "Meddelanden",
        link: "/meddelanden",
      },
      { name: "Notiser", link: "/notiser" },
    ];
  } else {
    // Fallback
    navItems = [{ name: "Bostadssök", link: "/bostader" }];
  }

  // Konto-menyn

  let accountMenuItems: NavItem[] = [];

  if (userType === "student") {
    accountMenuItems = [
      { name: "Mitt konto", link: "/profil" },
      { name: "Inställningar", link: "/installningar" },
      { name: "Hjälp", link: "/faq" },
    ];
  } else if (userType === "private_landlord" || userType === "company") {
    accountMenuItems = [
      { name: "Mitt konto", link: "/profil" },
      { name: "Inställningar", link: "/installningar" },
      { name: "Fakturering", link: "/fakturering" },
      { name: "Hjälp", link: "/faq" },
    ];
  } else if (user) {
    accountMenuItems = [{ name: "Mitt konto", link: "/profil" }];
  }

  const roleLabel =
    userType === "student"
      ? "Student"
      : userType === "private_landlord"
      ? "Privat uthyrare"
      : userType === "company"
      ? "Företag"
      : null;

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Stäng dropdown när man klickar utanför
  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAccountMenuOpen]);

  // Om vi laddar auth, visa en placeholder eller inget alls för att undvika layout-shift
  // Valfritt: Ta bort detta om du vill visa "Logga in" direkt och låta den bytas ut
  if (isLoading) {
      return (
        <Navbar className="top-4 opacity-0"> {/* Osynlig men tar plats */}
            <NavBody><div className="h-10"></div></NavBody>
        </Navbar>
      );
  }

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
          {!user ? (
            <>
              <NavbarButton variant="secondary" href="/logga-in">
                Logga in
              </NavbarButton>
              <NavbarButton variant="primary" href="/registrera">
                Skapa konto
              </NavbarButton>
            </>
          ) : (
            <div ref={accountMenuRef} className="relative flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-neutral-700">
                  {user.displayName || user.email}
                </span>
                {roleLabel && (
                  <span className="text-xs text-neutral-500">
                    {roleLabel}
                  </span>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[#004225] focus:ring-offset-2"
              >
                {/* Avatar placeholder eller användarens bild */}
                {user.logoUrl ? (
                     <div className="h-6 w-6 rounded-full overflow-hidden relative">
                        <Image src={user.logoUrl} alt="Avatar" fill className="object-cover" />
                     </div>
                ) : (
                    <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500">
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="hidden sm:inline">Konto</span>
                <span className="text-xs">▼</span>
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-neutral-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 py-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    {accountMenuItems.map((item) => (
                      <Link
                        key={item.link}
                        href={item.link || "#"}
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="border-t border-neutral-100 py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                  {item.dropdown ? (
                      <div className="py-2">
                          <span className="block px-2 text-sm font-semibold text-neutral-900 mb-2">{item.name}</span>
                          <div className="pl-4 space-y-2 border-l-2 border-neutral-100 ml-2">
                             {item.dropdown.map(sub => (
                                <Link 
                                    key={sub.name}
                                    href={sub.link}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-sm text-neutral-600 py-1"
                                >
                                    {sub.name}
                                </Link>
                             ))}
                          </div>
                      </div>
                  ) : (
                    <Link
                        href={item.link || "#"}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 text-base font-medium text-neutral-900 border-b border-neutral-100 last:border-0"
                    >
                        {item.name}
                    </Link>
                  )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200">
            {!user ? (
              <div className="flex flex-col gap-3">
                <NavbarButton
                  variant="secondary"
                  href="/logga-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full justify-center"
                >
                  Logga in
                </NavbarButton>
                <NavbarButton
                  variant="primary"
                  href="/registrera"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full justify-center"
                >
                  Skapa konto
                </NavbarButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-500">
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    {accountMenuItems.map((item) => (
                      <Link
                        key={item.link}
                        href={item.link || "#"}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-md bg-neutral-50 px-3 py-2 text-center text-sm font-medium text-neutral-700"
                      >
                        {item.name}
                      </Link>
                    ))}
                </div>
                
                <NavbarButton 
                    variant="secondary" 
                    onClick={handleLogout}
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                >
                  Logga ut
                </NavbarButton>
              </div>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
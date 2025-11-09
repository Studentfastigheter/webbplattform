"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

const baseNavItems = [
  { name: "Annonser", link: "/listings" },
  { name: "Alla köer", link: "/alla-koer" },
  { name: "För företag", link: "/for-foretag" },
  { name: "Hyra ut", link: "/hyra-ut" },
];

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = user
    ? [...baseNavItems, { name: "Köer & intressen", link: "/queues-interests" }]
    : baseNavItems;

  return (
    <Navbar className="top-4">
      <NavBody>
        <Link href="/" className="flex items-center gap-2 px-2 py-1 text-sm font-medium">
          <Image src="/campuslyan-logo.svg" alt="CampusLyan" width={30} height={30} />
          <div className="leading-tight">
            <span className="text-base">CampusLyan</span>
          </div>
        </Link>
        <NavItems items={navItems} />

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <span className="text-sm text-neutral-500">{user.email}</span>
              <NavbarButton variant="secondary" onClick={logout}>
                Logga ut
              </NavbarButton>
            </>
          ) : (
            <>
              <NavbarButton variant="secondary" href="/login">
                Logga in
              </NavbarButton>
              <NavbarButton variant="primary" href="/register">
                Skapa konto
              </NavbarButton>
            </>
          )}
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/campuslyan-logo.svg" alt="CampusLyan" width={26} height={26} />
            <span className="text-sm font-semibold">CampusLyan</span>
          </Link>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          {navItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base text-neutral-700"
            >
              {item.name}
            </Link>
          ))}
          <div className="flex w-full flex-col gap-3 pt-2">
            {user ? (
              <NavbarButton
                variant="secondary"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logga ut
              </NavbarButton>
            ) : (
              <>
                <NavbarButton variant="secondary" href="/login">
                  Logga in
                </NavbarButton>
                <NavbarButton variant="primary" href="/register">
                  Skapa konto
                </NavbarButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

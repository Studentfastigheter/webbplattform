"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Hem", link: "/" },
  { name: "För företag", link: "/for-foretag" },
  { name: "Partners", link: "/partners" },
  { name: "Om oss", link: "/om" },
];

const waitlistHref = "/#register-waitlist";

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className="top-4">
      <NavBody>
        <Link href="/" className="relative z-20 flex items-center gap-2 px-2 py-1 text-sm font-medium">
          <Image src="/campuslyan-logo.svg" alt="CampusLyan" width={30} height={30} />
          <div className="leading-tight">
            <span className="text-base">CampusLyan</span>
          </div>
        </Link>
        <NavItems items={navItems} />
        <Link
          href={waitlistHref}
          className="relative z-20 hidden rounded-full bg-[#004225] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00341d] lg:inline-flex"
        >
          Anmäl intresse
        </Link>
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
          <Link
            href={waitlistHref}
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#004225] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#00341d]"
          >
            Anmäl intresse
          </Link>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

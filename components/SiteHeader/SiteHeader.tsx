"use client";

import Image from "next/image";
import Link from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/user-avatar";
import { getUserDisplayName } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
  type NavbarItem,
} from "@/components/ui/resizable-navbar";
import LanguageToggle from "./LanguageToggle";
import { staticTranslate, useLang } from "@/context/LangContext";

type NavItem = NavbarItem;

const getInitial = (value: string) => value.trim().charAt(0).toUpperCase() || "C";

type AccountAvatarProps = {
  src?: string | null;
  alt: string;
  className: string;
  fallbackClassName: string;
  initial: string;
};

function AccountAvatar({
  src,
  alt,
  className,
  fallbackClassName,
  initial,
}: AccountAvatarProps) {
  const [currentSrc, setCurrentSrc] = useState(src || DEFAULT_PROFILE_IMAGE);

  useEffect(() => {
    setCurrentSrc(src || DEFAULT_PROFILE_IMAGE);
  }, [src]);

  if (!currentSrc) {
    return <div className={fallbackClassName}>{initial}</div>;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== DEFAULT_PROFILE_IMAGE) {
          setCurrentSrc(DEFAULT_PROFILE_IMAGE);
          return;
        }

        setCurrentSrc("");
      }}
    />
  );
}

export default function SiteHeader() {
  const { user, logout, isLoading } = useAuth();
  const { lang } = useLang();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const publicNavItems: NavItem[] = [
    { name: staticTranslate({ "se-SE": "Bostäder", "en-US": "Apartments" }, lang), link: "/bostader" },
    { name: staticTranslate({ "se-SE": "Alla köer", "en-US": "Queues" }, lang), link: "/alla-koer" },
    { name: staticTranslate({ "se-SE": "Kom igång", "en-US": "Get started" }, lang), link: "/" },
  ];
  
  const studentNavItems: NavItem[] = [
    {
      name: staticTranslate({ "se-SE": "Bostäder", "en-US": "Apartments" }, lang),
      link: "/bostader",
      dropdown: [
        { name: staticTranslate({ "se-SE": "Sök bostäder", "en-US": "Find apartments" }, lang), link: "/bostader" },
        { name: staticTranslate({ "se-SE": "Mina ansökningar", "en-US": "My applications" }, lang), link: "/ansokningar" },
        { name: staticTranslate({ "se-SE": "Sparade", "en-US": "Savings" }, lang), link: "/sparade" },
      ],
    },
    {
      name: staticTranslate({ "se-SE": "Alla köer", "en-US": "Queues" }, lang),
      link: "/alla-koer",
      dropdown: [
        { name: staticTranslate({ "se-SE": "Lägg till köer", "en-US": "Add queues" }, lang), link: "/alla-koer" },
        { name: staticTranslate({ "se-SE": "Mina köer", "en-US": "My queues" }, lang), link: "/koer" },
      ],
    },
    { name: staticTranslate({ "se-SE": "Notiser", "en-US": "Notifications" }, lang), link: "/notiser" },
  ];
  
  const landlordNavItems: NavItem[] = [
    { name: staticTranslate({ "se-SE": "Bostäder", "en-US": "Apartments" }, lang), link: "/bostader" },
    {
      name: staticTranslate({ "se-SE": "Mina annonser", "en-US": "My listings" }, lang),
      link: "/mina-annonser",
      dropdown: [
        { name: staticTranslate({ "se-SE": "Skapa ny", "en-US": "New listing" }, lang), link: "/mina-annonser/ny" },
        { name: staticTranslate({ "se-SE": "Mina annonser", "en-US": "My listings" }, lang), link: "/mina-annonser" },
        { name: staticTranslate({ "se-SE": "Ansökningar", "en-US": "Applications" }, lang), link: "/ansokningar" },
      ],
    },
    { name: staticTranslate({ "se-SE": "Notiser", "en-US": "Notifications" }, lang), link: "/notiser" },
  ];
  
  const getRoleLabel = (accountType?: string | null) => {
    if (accountType === "student") return "Student";
    if (accountType === "private_landlord") return staticTranslate({ "se-SE": "Privat uthyrare", "en-US": "Private landlord" }, lang);
    if (accountType === "company") return staticTranslate({ "se-SE": "Företag", "en-US": "Company" }, lang);
    return null;
  };

  const userType = user?.accountType;
  const roleLabel = getRoleLabel(userType);
  const displayName = getUserDisplayName(user);
  const accountInitial = getInitial(displayName || "CampusLyan");

  let navItems = publicNavItems;

  if (userType === "student") {
    navItems = studentNavItems;
  } else if (userType === "private_landlord" || userType === "company") {
    navItems = landlordNavItems;
  } else if (user) {
    navItems = [{ name: staticTranslate({ "se-SE": "Bostadssök", "en-US": "Find apartments" }, lang), link: "/bostader" }];
  }

  let accountMenuItems: NavItem[] = [];

  if (userType === "student") {
    accountMenuItems = [
      { name: staticTranslate({ "se-SE": "Mitt konto", "en-US": "My account" }, lang), link: "/profil" },
      { name: staticTranslate({ "se-SE": "Inställningar", "en-US": "Settings" }, lang), link: "/installningar" },
      { name: staticTranslate({ "se-SE": "Hjälp", "en-US": "Help" }, lang), link: "/faq" },
    ];
  } else if (userType === "private_landlord" || userType === "company") {
    accountMenuItems = [
      { name: staticTranslate({ "se-SE": "Mitt konto", "en-US": "" }, lang), link: "/profil" },
      { name: staticTranslate({ "se-SE": "Inställningar", "en-US": "" }, lang), link: "/installningar" },
      { name: staticTranslate({ "se-SE": "Fakturering", "en-US": "" }, lang), link: "/fakturering" },
      { name: staticTranslate({ "se-SE": "Hjälp", "en-US": "" }, lang), link: "/faq" },
    ];
  } else if (user) {
    accountMenuItems = [{ name: staticTranslate({ "se-SE": "Mitt konto", "en-US": "My account" }, lang), link: "/profil" }];
  }

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  };

  const handleMobileToggle = () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleAccountToggle = () => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
  };

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAccountMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  if (isLoading) {
    return (
      <Navbar className="top-4 opacity-0">
        <NavBody>
          <div className="h-10" />
        </NavBody>
      </Navbar>
    );
  }

  return (
    <Navbar className="top-4">
      <LanguageToggle className="ml-4"/>
      <NavBody>
        <Link
          href="/"
          className="relative z-20 flex items-center gap-2 px-2 py-1 text-sm font-medium"
          aria-label={staticTranslate({ 
              "se-SE": "Gå till startsidan", 
              "en-US": "Go to the start page", 
          }, lang)}
        >
          <Image
            src="/campuslyan-logo.svg"
            alt="CampusLyan"
            width={30}
            height={30}
            priority
          />
          <div className="leading-tight">
            <span className="text-base">CampusLyan</span>
          </div>
        </Link>
        <NavItems items={navItems} onItemClick={() => setIsAccountMenuOpen(false)} />

        <div className="relative z-20 hidden items-center gap-2 lg:flex">
          {!user ? (
            <>
              <Link
                href="/logga-in"
                className="inline-flex rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                {staticTranslate({ "se-SE": "Logga in", "en-US": "Log in" }, lang)}
              </Link>
              <Link
                href="/registrera"
                className="inline-flex rounded-full bg-[#004225] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00341d]"
              >
                {staticTranslate({ "se-SE": "Skapa konto", "en-US": "New account" }, lang)}
              </Link>
            </>
          ) : (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                onClick={handleAccountToggle}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004225]"
              >
                <AccountAvatar
                  src={user.logoUrl}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover"
                  fallbackClassName="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600"
                  initial={accountInitial}
                />
                <div className="hidden max-w-32 sm:block">
                  <p className="truncate text-left text-sm font-medium text-neutral-900">
                    {displayName}
                  </p>
                </div>
                <IconChevronDown
                  className={cn(
                    "h-4 w-4 text-neutral-400 transition-transform",
                    isAccountMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] animate-dropdown">
                  <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-3">
                    <AccountAvatar
                      src={user.logoUrl}
                      alt={displayName}
                      className="h-9 w-9 rounded-full object-cover"
                      fallbackClassName="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-neutral-600"
                      initial={accountInitial}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-950">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {roleLabel ?? user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 grid gap-1">
                    {accountMenuItems.map((item) => (
                      <Link
                        key={item.link}
                        href={item.link}
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    {staticTranslate({ "se-SE": "Logga ut", "en-US": "Log out"}, lang)}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <Link href="/" className="flex items-center gap-2" aria-label="Gå till startsidan">
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
            onClick={handleMobileToggle}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          <div className="flex w-full flex-col gap-3">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.link}
                  onClick={closeMenus}
                  className="text-base text-neutral-700"
                >
                  {item.name}
                </Link>

                {item.dropdown && item.dropdown.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 border-l-2 border-neutral-100 pl-4">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.link}
                        href={subItem.link}
                        onClick={closeMenus}
                        className="text-sm text-neutral-500"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {!user ? (
              <>
                <Link
                  href="/logga-in"
                  onClick={closeMenus}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-neutral-200 px-5 py-3 text-base font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                    {staticTranslate({ "se-SE": "Logga in", "en-US": "Log in" }, lang)}
                </Link>
                <Link
                  href="/registrera"
                  onClick={closeMenus}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#004225] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#00341d]"
                >
                  {staticTranslate({ "se-SE": "Skapa konto", "en-US": "New account" }, lang)}
                  Skapa konto
                </Link>
              </>
            ) : (
              <div className="mt-2 w-full border-t border-neutral-200 pt-4">
                <div className="mb-3 flex items-center gap-3 px-1">
                  <AccountAvatar
                    src={user.logoUrl}
                    alt={displayName}
                    className="h-9 w-9 rounded-full object-cover"
                    fallbackClassName="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600"
                    initial={accountInitial}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-950">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {roleLabel ?? user.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  {accountMenuItems.map((item) => (
                    <Link
                      key={item.link}
                      href={item.link}
                      onClick={closeMenus}
                      className="rounded-xl px-3 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                    {staticTranslate({ "se-SE": "Logga ut", "en-US": "Log out" }, lang)}
                </button>
              </div>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

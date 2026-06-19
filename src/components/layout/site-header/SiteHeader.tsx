"use client";

import Image from "next/image";
import { IconChevronDown } from "@/components/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserDisplayName } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { type User } from "@/types";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";
import { isPlatformLaunched } from "@/lib/platform-launch";
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

type NavItem = NavbarItem;

const getInitial = (value: string) => value.trim().charAt(0).toUpperCase() || "C";
const getLogoUrl = (user?: User | null) => user?.logoUrl?.trim() || "";

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
  const [currentSrc, setCurrentSrc] = useState(src || "");

  useEffect(() => {
    setCurrentSrc(src || "");
  }, [src]);

  if (!currentSrc) {
    return <div className={fallbackClassName}>{initial}</div>;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={() => setCurrentSrc("")}
    />
  );
}

export default function SiteHeader() {
  const { user, logout, isLoading } = useAuth();
  const { locale, localizedHref, t } = useI18n();
  const platformLaunched = isPlatformLaunched();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const currentUser = platformLaunched ? user : null;
  const userType = currentUser?.accountType;
  const isQuickRegister = userType === "quick_register";
  const roleLabel =
    userType === "student"
      ? t("siteHeader.roles.student")
      : isQuickRegister
        ? localizedText(locale, "Quick-register konto", "Quick-register account")
        : userType === "private_landlord" || userType === "company"
          ? t("siteHeader.roles.company")
          : null;
  const displayName = getUserDisplayName(currentUser);
  const accountInitial = getInitial(displayName || "CampusLyan");
  const avatarSrc = getLogoUrl(currentUser);

  const publicNavItems = useMemo<NavItem[]>(
    () =>
      platformLaunched
        ? [
            { name: t("siteHeader.nav.home"), link: localizedHref("/") },
            { name: t("siteHeader.nav.housing"), link: localizedHref("/housing") },
            { name: t("siteHeader.nav.allQueues"), link: localizedHref("/all-queues") },
            { name: t("siteHeader.nav.cities"), link: localizedHref("/cities") },
          ]
        : [
            { name: t("siteHeader.nav.home"), link: localizedHref("/") },
            { name: t("siteFooter.links.forBusiness"), link: localizedHref("/for-business") },
            { name: t("siteFooter.links.ourPartners"), link: localizedHref("/partners") },
            { name: t("siteFooter.links.about"), link: localizedHref("/about-us") },
          ],
    [localizedHref, platformLaunched, t],
  );

  const studentNavItems = useMemo<NavItem[]>(
    () => [
      {
        name: t("siteHeader.nav.housing"),
        link: localizedHref("/housing"),
        dropdown: [
          { name: t("siteHeader.nav.searchHousing"), link: localizedHref("/housing") },
          { name: t("siteHeader.nav.applications"), link: localizedHref("/applications") },
          { name: t("siteHeader.nav.saved"), link: localizedHref("/saved") },
        ],
      },
      {
        name: t("siteHeader.nav.allQueues"),
        link: localizedHref("/all-queues"),
        dropdown: [
          { name: t("siteHeader.nav.addQueues"), link: localizedHref("/all-queues") },
          { name: t("siteHeader.nav.myQueues"), link: localizedHref("/queues") },
        ],
      },
      { name: t("siteHeader.nav.cities"), link: localizedHref("/cities") },
      { name: t("siteHeader.nav.notifications"), link: localizedHref("/notifications") },
    ],
    [localizedHref, t],
  );

  const landlordNavItems = useMemo<NavItem[]>(
    () => [
      { name: t("siteHeader.nav.housing"), link: localizedHref("/housing") },
      { name: t("siteHeader.nav.cities"), link: localizedHref("/cities") },
      {
        name: t("siteHeader.nav.myListings"),
        link: localizedHref("/my-listings"),
        dropdown: [
          { name: t("siteHeader.nav.createNew"), link: localizedHref("/my-listings/new") },
          { name: t("siteHeader.nav.myListings"), link: localizedHref("/my-listings") },
          { name: t("siteHeader.nav.applications"), link: localizedHref("/applications") },
        ],
      },
      { name: t("siteHeader.nav.notifications"), link: localizedHref("/notifications") },
    ],
    [localizedHref, t],
  );

  let navItems = publicNavItems;

  if (userType === "student") {
    navItems = studentNavItems;
  } else if (userType === "private_landlord" || userType === "company") {
    navItems = landlordNavItems;
  } else if (currentUser && !isQuickRegister) {
    navItems = [
      { name: t("siteHeader.nav.housingSearch"), link: localizedHref("/housing") },
      { name: t("siteHeader.nav.cities"), link: localizedHref("/cities") },
    ];
  }

  let accountMenuItems: NavItem[] = [];

  if (userType === "student") {
    accountMenuItems = [
      { name: t("siteHeader.account.myAccount"), link: localizedHref("/profile") },
      { name: t("siteHeader.account.settings"), link: localizedHref("/settings") },
      { name: t("siteHeader.account.help"), link: localizedHref("/faq") },
    ];
  } else if (isQuickRegister) {
    accountMenuItems = [
      { name: t("siteHeader.account.settings"), link: localizedHref("/settings") },
      { name: t("siteHeader.account.help"), link: localizedHref("/faq") },
    ];
  } else if (userType === "private_landlord" || userType === "company") {
    accountMenuItems = [
      { name: t("siteHeader.account.myAccount"), link: localizedHref("/profile") },
      { name: t("siteHeader.account.settings"), link: localizedHref("/settings") },
      { name: t("siteHeader.account.help"), link: localizedHref("/faq") },
    ];
  } else if (currentUser) {
    accountMenuItems = [
      { name: t("siteHeader.account.myAccount"), link: localizedHref("/profile") },
    ];
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

  if (platformLaunched && isLoading) {
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
      <NavBody>
        <Link
          href="/"
          className="relative z-20 flex items-center gap-2 px-2 py-1 text-sm font-medium"
          aria-label={t("siteHeader.homeAria")}
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

        <div className="relative z-20 hidden items-center gap-2 xl:flex">
          <LanguageSwitcher compact />
          {platformLaunched && !currentUser ? (
            <>
              <Link
                href="/login"
                className="inline-flex rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                {t("siteHeader.auth.login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-full bg-[#004225] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#00341d]"
              >
                {t("siteHeader.auth.createAccount")}
              </Link>
            </>
          ) : platformLaunched && currentUser ? (
            <>
              {isQuickRegister ? (
                <Link
                  href="/register/freja-id?flow=quick-register"
                  className="inline-flex rounded-full bg-[#3E3A93] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#302d78] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3E3A93]"
                >
                  {localizedText(locale, "Verify now", "Verify now")}
                </Link>
              ) : null}
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={handleAccountToggle}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004225]"
                >
                  <AccountAvatar
                    src={avatarSrc}
                    alt={displayName}
                    className={cn(
                      "h-8 w-8",
                      userType === "company"
                        ? "rounded-md bg-white object-contain p-0.5 ring-1 ring-neutral-200"
                        : "rounded-full object-cover"
                    )}
                    fallbackClassName={cn(
                      "flex h-8 w-8 items-center justify-center bg-neutral-100 text-xs font-semibold text-neutral-600",
                      userType === "company" ? "rounded-md" : "rounded-full"
                    )}
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
                        src={avatarSrc}
                        alt={displayName}
                        className={cn(
                          "h-9 w-9",
                          userType === "company"
                            ? "rounded-md bg-white object-contain p-0.5 ring-1 ring-neutral-200"
                            : "rounded-full object-cover"
                        )}
                        fallbackClassName={cn(
                          "flex h-9 w-9 items-center justify-center bg-white text-sm font-semibold text-neutral-600",
                          userType === "company" ? "rounded-md" : "rounded-full"
                        )}
                        initial={accountInitial}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-950">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {roleLabel ?? currentUser.email}
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
                      {t("siteHeader.auth.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <Link href="/" className="flex items-center gap-2" aria-label={t("siteHeader.homeAria")}>
            <Image
              src="/campuslyan-logo.svg"
              alt="CampusLyan"
              width={26}
              height={26}
            />
            <span className="text-sm font-semibold">CampusLyan</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={handleMobileToggle}
            />
          </div>
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

            {platformLaunched && !currentUser ? (
              <>
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-neutral-200 px-5 py-3 text-base font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  {t("siteHeader.auth.login")}
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#004225] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#00341d]"
                >
                  {t("siteHeader.auth.createAccount")}
                </Link>
              </>
            ) : platformLaunched && currentUser ? (
              <div className="mt-2 w-full border-t border-neutral-200 pt-4">
                {isQuickRegister ? (
                  <Link
                    href="/register/freja-id?flow=quick-register"
                    onClick={closeMenus}
                    className="mb-3 inline-flex w-full items-center justify-center rounded-full bg-[#3E3A93] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#302d78]"
                  >
                    {localizedText(locale, "Verify now", "Verify now")}
                  </Link>
                ) : null}
                <div className="mb-3 flex items-center gap-3 px-1">
                  <AccountAvatar
                    src={avatarSrc}
                    alt={displayName}
                    className={cn(
                      "h-9 w-9",
                      userType === "company"
                        ? "rounded-md bg-white object-contain p-0.5 ring-1 ring-neutral-200"
                        : "rounded-full object-cover"
                    )}
                    fallbackClassName={cn(
                      "flex h-9 w-9 items-center justify-center bg-neutral-100 text-sm font-semibold text-neutral-600",
                      userType === "company" ? "rounded-md" : "rounded-full"
                    )}
                    initial={accountInitial}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-950">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {roleLabel ?? currentUser.email}
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
                  {t("siteHeader.auth.logout")}
                </button>
              </div>
            ) : null}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

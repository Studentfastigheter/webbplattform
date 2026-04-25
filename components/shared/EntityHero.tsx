"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type EntityHeroBadgeTone = "success" | "warning" | "neutral";

export type EntityHeroBadge = {
  label: string;
  icon?: ReactNode;
  tone?: EntityHeroBadgeTone;
};

export type EntityHeroActionLink = {
  label: string;
  href?: string;
  icon: ReactNode;
  external?: boolean;
  disabled?: boolean;
  className?: string;
};

export type EntityHeroSection = {
  id?: string;
  title: string;
  content: ReactNode;
  className?: string;
};

type EntityHeroProps = {
  title: string;
  bannerImage?: string | null;
  bannerAlt?: string;
  avatarImage?: string | null;
  avatarAlt?: string;
  avatarShape?: "rounded" | "circle";
  avatarFit?: "cover" | "contain";
  badge?: EntityHeroBadge;
  meta?: ReactNode;
  actionLinks?: EntityHeroActionLink[];
  headerActions?: ReactNode;
  sections?: EntityHeroSection[];
  className?: string;
  contentClassName?: string;
  avatarWrapperClassName?: string;
};

const badgeToneClassMap: Record<EntityHeroBadgeTone, string> = {
  success:
    "border-emerald-200/80 bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-500/10",
  warning:
    "border-amber-200/80 bg-white text-amber-700 shadow-sm ring-1 ring-amber-500/10",
  neutral:
    "border-slate-200/80 bg-white text-slate-700 shadow-sm ring-1 ring-slate-500/10",
};

export default function EntityHero({
  title,
  bannerImage,
  bannerAlt,
  avatarImage,
  avatarAlt,
  avatarShape = "rounded",
  avatarFit = "cover",
  badge,
  meta,
  actionLinks = [],
  headerActions,
  sections = [],
  className,
  contentClassName,
  avatarWrapperClassName,
}: EntityHeroProps) {
  const hasActions = actionLinks.length > 0 || Boolean(headerActions);
  const titleInitial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <section className={cn("w-full", className)}>
      <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-[280px] md:h-[340px]">
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt={bannerAlt ?? title}
            fill
            className="object-cover"
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#f8fafc_0%,#eef2f7_100%)]" />
        )}
      </div>

      <div
        className={cn(
          "relative mx-auto max-w-4xl px-4 sm:px-6",
          contentClassName
        )}
      >
        <div className={cn("relative -mt-14 mb-4 sm:-mt-24", avatarWrapperClassName)}>
          <div
            className={cn(
              "shrink-0 overflow-hidden border-4 border-white bg-white shadow-lg",
              avatarShape === "circle"
                ? "h-28 w-28 rounded-full sm:h-36 sm:w-36"
                : "h-28 w-28 rounded-2xl sm:h-36 sm:w-36"
            )}
          >
            {avatarImage ? (
              <Image
                src={avatarImage}
                alt={avatarAlt ?? title}
                width={144}
                height={144}
                className={cn(
                  "h-full w-full",
                  avatarFit === "contain" ? "object-contain p-2" : "object-cover"
                )}
                unoptimized={avatarFit === "contain"}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50 text-4xl font-semibold text-gray-500 sm:text-5xl">
                {titleInitial}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="min-w-0 text-2xl font-bold text-gray-900 sm:text-3xl">
                {title}
              </h1>

              {badge && (
                <span
                  className={cn(
                    "inline-flex h-7 items-center gap-2 rounded-full border py-1 pl-2 pr-3 text-xs font-medium",
                    badgeToneClassMap[badge.tone ?? "neutral"]
                  )}
                >
                  {badge.icon && (
                    <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-current/10">
                      {badge.icon}
                    </span>
                  )}
                  <span>{badge.label}</span>
                </span>
              )}
            </div>

            {meta && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                {meta}
              </div>
            )}
          </div>

          {hasActions && (
            <div className="flex shrink-0 flex-wrap items-center gap-1.5 md:justify-end">
              {actionLinks.map((item) => {
                const baseClassName =
                  "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors";
                const stateClassName =
                  item.disabled || !item.href
                    ? "cursor-default bg-gray-50 text-gray-300"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600";

                const content = (
                  <span
                    aria-label={item.label}
                    title={item.label}
                    className={cn(
                      baseClassName,
                      stateClassName,
                      item.className
                    )}
                  >
                    {item.icon}
                  </span>
                );

                if (item.disabled || !item.href) {
                  return <span key={item.label}>{content}</span>;
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {content}
                  </a>
                );
              })}

              {actionLinks.length > 0 && headerActions && (
                <div className="mx-0.5 h-5 w-px bg-gray-200" />
              )}

              {headerActions}
            </div>
          )}
        </div>

        {sections.map((section) => (
          <div
            key={section.id ?? section.title}
            className={cn("mt-8", section.className)}
          >
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              {section.title}
            </h2>
            {section.content}
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";
import {
  ADMIN_SECTION_DETAILS,
  type AdminSection,
} from "./shared";

/**
 * Tunn router-skal för admin-verktygen. Varje sektion ligger i en egen modul
 * under `sections/` och laddas lat via next/dynamic — så en admin-route drar
 * bara ner JS för sin egen sektion i stället för hela verktygsbandet (tidigare
 * ett ~4900-raders monolitiskt klientpaket delat av alla routes).
 */

function SectionLoading() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-gray-400">
      <span className="h-2 w-2 animate-ping rounded-full bg-brand-500" />
      <span className="ml-3">Laddar sektion…</span>
    </div>
  );
}

const dyn = (loader: () => Promise<{ default: ComponentType }>) =>
  dynamic(loader, { ssr: false, loading: SectionLoading });

const SECTION_COMPONENTS: Record<AdminSection, ComponentType> = {
  tags: dyn(() => import("./sections/TagsForm")),
  schools: dyn(() => import("./sections/SchoolsForm")),
  cities: dyn(() => import("./sections/CitiesForm")),
  locations: dyn(() => import("./sections/LocationCategoriesForm")),
  companies: dyn(() => import("./sections/CompaniesForm")),
  "external-companies": dyn(() => import("./sections/ExternalCompaniesSection")),
  accounts: dyn(() => import("./sections/CompanyAccountForm")),
  activities: dyn(() => import("./sections/ActivitiesForm")),
  waitlist: dyn(() => import("./sections/WaitlistDashboard")),
  statistics: dyn(() => import("./sections/StatisticsSection")),
  analytics: dyn(() =>
    import("./AdminAnalyticsDashboard").then((m) => ({
      default: m.AdminAnalyticsDashboard,
    }))
  ),
};

export function AdminToolPage({ section }: { section: AdminSection }) {
  const details = ADMIN_SECTION_DETAILS[section];
  const Section = SECTION_COMPONENTS[section];

  return (
    <main className="space-y-6 text-gray-800">
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold leading-8 text-gray-950">
            {details.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
            {details.description}
          </p>
        </div>
        <div className="portal-control flex h-10 w-fit shrink-0 items-center gap-2 px-3 text-xs font-semibold text-gray-600">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              section === "waitlist" || section === "statistics"
                ? "bg-emerald-500"
                : "bg-brand-500"
            )}
          />
          {details.badge}
        </div>
      </header>

      <div className="flex flex-col gap-5">
        <Section />
      </div>
    </main>
  );
}

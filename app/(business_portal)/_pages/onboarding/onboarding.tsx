"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useDashboardFooter } from "../../_components/DashboardShell";
import { dashboardRelPath } from "../../_statics/variables";
import { ListingDraftProvider } from "./listingDraftContext";

const FOOTER_HEIGHT = "88px";

type FooterContentProps = {
  currentStep: number;
  nextPagePossible: boolean;
  previousPagePossible: boolean;
  stepLabels: string[];
};

function ActionLink({
  children,
  disabled,
  href,
  variant = "secondary",
}: {
  children: ReactNode;
  disabled?: boolean;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors";
  const classes =
    variant === "primary"
      ? `${base} bg-[#004225] text-white hover:bg-[#06391f]`
      : `${base} text-gray-600 hover:bg-gray-50 hover:text-gray-950`;

  if (disabled) {
    return <span className={`${classes} pointer-events-none opacity-40`}>{children}</span>;
  }

  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}

function FooterContent({
  currentStep,
  nextPagePossible,
  previousPagePossible,
  stepLabels,
}: FooterContentProps) {
  const path = `${dashboardRelPath}/annonser/ny/onboarding/`;
  const nextLabel = stepLabels[currentStep] ?? "Nästa";

  return (
    <div className="w-full px-4 pb-5 md:px-6">
      <div className="pointer-events-auto mx-auto w-full max-w-4xl">
        <div className="mx-auto flex w-fit max-w-full items-center gap-1 rounded-md border border-gray-200 bg-white/95 p-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <ActionLink
            href={previousPagePossible ? `${path}${currentStep - 1}` : `${dashboardRelPath}/annonser`}
          >
            <ChevronLeft className="h-4 w-4" />
            {previousPagePossible ? "Tillbaka" : "Avbryt"}
          </ActionLink>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <ActionLink
            href={nextPagePossible ? `${path}${currentStep + 1}` : "#"}
            disabled={!nextPagePossible}
            variant="primary"
          >
            {nextPagePossible ? nextLabel : "Klar"}
            <ChevronRight className="h-4 w-4" />
          </ActionLink>
        </div>
      </div>
    </div>
  );
}

function ProgressHeader({
  currentStep,
  stepLabels,
}: {
  currentStep: number;
  stepLabels: string[];
}) {
  const totalSteps = stepLabels.length;
  const currentLabel = stepLabels[currentStep - 1] ?? "Steg";

  return (
    <div className="mx-auto mb-8 w-full max-w-4xl px-4 pt-2 md:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500">
            Steg {currentStep} av {totalSteps}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950">
            {currentLabel}
          </h1>
        </div>
        <p className="hidden text-sm text-gray-500 sm:block">Utkast sparas automatiskt</p>
      </div>
    </div>
  );
}

type Props = {
  currentStep: number;
  stepLabels: string[];
  stepPagesList: Array<Array<React.ComponentType>>;
};

export default function Onboarding({
  currentStep,
  stepLabels,
  stepPagesList,
}: Props) {
  const flatPagesList = stepPagesList.flat();
  const nextPagePossible = currentStep + 1 <= flatPagesList.length;
  const previousPagePossible = currentStep - 1 >= 1;
  const setFooter = useDashboardFooter();
  const CurrentStepPage = flatPagesList[currentStep - 1];

  useEffect(() => {
    setFooter(
      <FooterContent
        currentStep={currentStep}
        nextPagePossible={nextPagePossible}
        previousPagePossible={previousPagePossible}
        stepLabels={stepLabels}
      />,
    );

    return () => setFooter(null);
  }, [
    currentStep,
    nextPagePossible,
    previousPagePossible,
    setFooter,
    stepLabels,
  ]);

  return (
    <ListingDraftProvider>
      <div
        style={{
          "--footer-height": FOOTER_HEIGHT,
          marginBottom: `calc(${FOOTER_HEIGHT} + 40px)`,
        } as React.CSSProperties}
        className="min-h-[calc(100vh-140px)]"
      >
        <ProgressHeader currentStep={currentStep} stepLabels={stepLabels} />
        <div className="px-4 md:px-6">
          <CurrentStepPage />
        </div>
      </div>
    </ListingDraftProvider>
  );
}

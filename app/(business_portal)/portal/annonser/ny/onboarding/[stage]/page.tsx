"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import Onboarding from "@/app/(business_portal)/_pages/onboarding/onboarding";
import CreateListingPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/createListingPage";
import PublishReviewPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/publishReviewPage";

const stepPagesList = [
  [CreateListingPage],
  [PublishReviewPage],
];

const stepLabels = [
  "Annonsuppgifter",
  "Förhandsgranska",
];

const MAX_PAGE = stepPagesList.reduce((total, stage) => total + stage.length, 0);

function getStageNumber(stage: string): number {
  if (!/^[0-9]+$/.test(stage)) {
    return notFound();
  }

  return Number(stage);
}

export function isStageNumberValid(stage: number): boolean {
  return stage >= 1 && stage <= MAX_PAGE;
}

type ParamsProps = {
  params: Promise<{ stage: string }>;
};

export default function OnboardingStage({ params }: ParamsProps) {
  const { stage } = use(params);
  const stageNumber = getStageNumber(stage);

  if (!isStageNumberValid(stageNumber)) {
    return notFound();
  }

  return (
    <Onboarding
      currentStep={stageNumber}
      stepLabels={stepLabels}
      stepPagesList={stepPagesList}
    />
  );
}

"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import Onboarding from "@/app/(business_portal)/_pages/onboarding/onboarding";
import AddObjectInfo from "@/app/(business_portal)/_pages/onboarding/onboardingPages/addObjectInfo";
import HousingDetailsPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/housingDetailsPage";
import ObjectTimespan from "@/app/(business_portal)/_pages/onboarding/onboardingPages/objectTimespan";
import ListingContentPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/listingContentPage";
import ImagePublishPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/imagePublishPage";
import PublishReviewPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/publishReviewPage";

const stepPagesList = [
  [AddObjectInfo],
  [HousingDetailsPage],
  [ObjectTimespan],
  [ListingContentPage],
  [ImagePublishPage],
  [PublishReviewPage],
];

const stepLabels = [
  "Grunddata",
  "Hyra",
  "Datum",
  "Text",
  "Bilder",
  "Publicera",
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

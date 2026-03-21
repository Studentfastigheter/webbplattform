"use client";

import Onboarding from "@/app/(business_portal)/_pages/onboarding/onboarding";
import { use } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

import AddObjectInfo from "@/app/(business_portal)/_pages/onboarding/onboardingPages/addObjectInfo";
import InfoCoverPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/infoCoverPage";
import ObjectSize from "@/app/(business_portal)/_pages/onboarding/onboardingPages/objectSize";
import ObjectTimespan from "@/app/(business_portal)/_pages/onboarding/onboardingPages/objectTimespan";
import ObjectType from "@/app/(business_portal)/_pages/onboarding/onboardingPages/objectType";
import ObjectType2 from "@/app/(business_portal)/_pages/onboarding/onboardingPages/objectType2";
import StageTellUsPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/stageTellUsPage";
import StageOptimizePage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/stageOptimizePage";
import StagePublishPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/stagePublishPage";
import ImagePublishPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/imagePublishPage";
import DescriptionPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/descriptionPage";
import AmenitiesPage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/amenitiesPage";
import TitlePage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/titlePage";
import PricePage from "@/app/(business_portal)/_pages/onboarding/onboardingPages/pricePage";

const MapPointer = dynamic(() => import("@/app/(business_portal)/_pages/onboarding/onboardingPages/mapPointer"), { ssr: false });


const stepPagesList = [
    [ // Stage 1
        InfoCoverPage,
        StageTellUsPage,
        AddObjectInfo,
        MapPointer,
        ObjectType,
        ObjectType2,
        ObjectSize,
        ObjectTimespan
    ],
    [ // Stage 2
        StageOptimizePage,
        AmenitiesPage,
        ImagePublishPage,
        TitlePage,
        DescriptionPage,
    ],
    [ // Stage 3
        StagePublishPage,
        PricePage,
        InfoCoverPage,
        InfoCoverPage,
    ],
]

const MAX_PAGE = stepPagesList.reduce((total, stage) => total + stage.length, 0);


function getStageNumber(stage: string): number {
    // Validera numerisk input
    const isNumeric = /^[0-9]+$/.test(stage);
    if (!isNumeric) {
        return notFound();
    }
    const stageNumber = Number(stage);
    return stageNumber;
}

export function isStageNumberValid(stage: number): boolean {
    return (stage >= 1 && stage <= MAX_PAGE);
}




type ParamsProps = {
    params: Promise<{ stage: string }>;
};

export default function OnboardingStage({
  params,
}: ParamsProps) {
    const { stage } = use(params);
    const stageNumber = getStageNumber(stage);
    
    if (!isStageNumberValid(stageNumber)) {
        return notFound();
    }


    return (
        <>
            <Onboarding 
                currentStep={stageNumber} 
                stepPagesList={stepPagesList}
            />
        </>
    );
}

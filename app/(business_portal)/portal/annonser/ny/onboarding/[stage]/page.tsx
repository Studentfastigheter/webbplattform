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

const MapPointer = dynamic(() => import("@/app/(business_portal)/_pages/onboarding/onboardingPages/mapPointer"), { ssr: false });


const stepPagesList = [
    [ // Stage 1
        InfoCoverPage,
        AddObjectInfo,
        MapPointer,
        ObjectType,
        ObjectType2,
        ObjectSize,
        ObjectTimespan
    ],
    [ // Stage 2
        InfoCoverPage,
        InfoCoverPage,
        InfoCoverPage,
        InfoCoverPage,
    ],
    [ // Stage 3
        InfoCoverPage,
        InfoCoverPage,
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

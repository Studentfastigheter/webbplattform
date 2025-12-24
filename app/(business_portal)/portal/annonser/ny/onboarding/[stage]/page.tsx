"use client";
import Onboarding from "@/app/(business_portal)/_pages/onboarding/onboarding";
import { Button } from "@/components/ui/button";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import NormalButton from "@/app/(business_portal)/_components/NormalButton";
import { dashboardRelPath } from "@/app/(business_portal)/_statics/variables";

const MAX_PAGE = 6;
const path = dashboardRelPath + "/annonser/ny/onboarding/";



function getStageNumber(stage: string): number {
    // Validera numerisk input
    const isNumeric = /^[0-9]+$/.test(stage);
    if (!isNumeric) {
        return notFound();
    }
    const stageNumber = Number(stage);
    return stageNumber;
}

function isStageNumberValid(stage: number): boolean {
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

    const nextPagePossible = isStageNumberValid(stageNumber + 1);
    const previousPagePossible = isStageNumberValid(stageNumber - 1);



    return (
        <>
            <Onboarding currentStep={stageNumber} />
            <div className="fixed bottom-0 left-56 right-0 flex justify-between p-4 bg-white">
                <NormalButton 
                    text="Tillbaka"
                    href={previousPagePossible ? path + (stageNumber - 1).toString() : "#"}
                    disabled={!previousPagePossible}
                />
                <NormalButton 
                    text="Nästa" 
                    href={nextPagePossible ? path + (stageNumber + 1).toString() : "#"}
                    variant="primary"
                    disabled={!nextPagePossible}
                />
            </div>
        </>
    );
}

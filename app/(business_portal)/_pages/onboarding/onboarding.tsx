"use client";

import { useDashboardFooter } from "../../_components/DashboardShell";
import { useEffect } from "react";
import NormalButton from "../../_components/NormalButton";
import { dashboardRelPath } from "../../_statics/variables";
import { isStageNumberValid } from "../../portal/annonser/ny/onboarding/[stage]/page";




const FOOTER_HEIGHT = "68px";


function getStageProgress(
  stepPagesList: any[][],
  currentStepIndex: number // 0-based index in flattened list
): number[] {
  let globalIndex = 0;

  return stepPagesList.map(stage => {
    const stageStart = globalIndex;
    const stageEnd = globalIndex + stage.length;

    let progress: number;

    if (currentStepIndex >= stageEnd) {
      // Stage fully completed
      progress = 1;
    } else if (currentStepIndex < stageStart) {
      // Stage not started
      progress = 0;
    } else {
      // Currently inside this stage
      progress = (currentStepIndex - stageStart + 1) / stage.length;
    }

    globalIndex = stageEnd;

    return progress;
  });
}


type FooterContentProps = {
    stageNumber: number,
    nextPagePossible: boolean,
    previousPagePossible: boolean,
    stepPagesList: any[][]
}

function FooterContent({
    stageNumber, 
    nextPagePossible, 
    previousPagePossible,
    stepPagesList
}: FooterContentProps) {

    const path = dashboardRelPath + "/annonser/ny/onboarding/";
    const stageProgress = getStageProgress(stepPagesList, stageNumber - 1);

    return (
        <div>
            <div className="flex gap-1">
                {
                    stepPagesList.map((stage, index) => (
                        <div key={index} className="h-1 flex-1">
                            <div style={{
                                "width": `${stageProgress[index] * 100}%`
                            }} 
                            className="bg-gray-700 h-full"
                            />
                        </div>
                    ))
                }
            </div>
            <div className="flex justify-between p-4 bg-white">
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
        </div>
    )
}


type Props = {
    currentStep: number,
    stepPagesList: any[][]
};

export default function Onboarding(
    { 
        currentStep,
        stepPagesList,
    }: Props) {

    const flatPagesList = stepPagesList.flat();

    const nextPagePossible = isStageNumberValid(currentStep + 1);
    const previousPagePossible = isStageNumberValid(currentStep - 1);

    const setFooter = useDashboardFooter();

    useEffect(() => {
        setFooter(<FooterContent stepPagesList={stepPagesList} stageNumber={currentStep} nextPagePossible={nextPagePossible} previousPagePossible={previousPagePossible} />);
    }, [setFooter, currentStep, nextPagePossible, previousPagePossible]);

    const CurrentStepPage = flatPagesList[currentStep - 1];

    

    return (
        <div
            style={{
                "--footer-height": FOOTER_HEIGHT,
                marginBottom: `calc(${FOOTER_HEIGHT} + 40px)` // Footer + Header height
            } as React.CSSProperties}
            className="flex flex-col flex-1"
        >
            <CurrentStepPage />
        </div>
    );
}
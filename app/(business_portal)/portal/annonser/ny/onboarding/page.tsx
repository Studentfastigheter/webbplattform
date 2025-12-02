"use client";
import Onboarding from "@/app/(business_portal)/_pages/onboarding";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const MAX_PAGE = 4;

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < MAX_PAGE - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <>
            <Onboarding currentStep={currentStep} />
            <div className="fixed bottom-0 left-56 right-0 flex justify-between p-4 bg-white">
                <Button className="cursor-pointer" variant="secondary" onClick={prevStep}>
                    Tillbaka
                </Button>
                <Button className="cursor-pointer" onClick={nextStep}>
                    Nästa
                </Button>
            </div>
        </>
    )
}
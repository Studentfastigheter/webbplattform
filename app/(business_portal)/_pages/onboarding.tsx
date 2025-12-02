import AddObjectInfo from "./onboarding/onboardingPages/addObjectInfo";

const PAGES_ORDER = [
    AddObjectInfo,
];



export default function Onboarding(
    { currentStep }: 
    { currentStep: number }
) {
    return (
        <>
            {PAGES_ORDER[currentStep] && 
                (() => {
                    const PageComponent = PAGES_ORDER[currentStep];
                    return <PageComponent />;
                })()
            }
        </>
    );
}
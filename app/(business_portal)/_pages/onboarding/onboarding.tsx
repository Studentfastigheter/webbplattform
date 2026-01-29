import AddObjectInfo from "./onboardingPages/addObjectInfo";
import MapPointer from "./onboardingPages/mapPointer";
import ObjectSize from "./onboardingPages/objectSize";
import ObjectTimespan from "./onboardingPages/objectTimespan";
import ObjectType from "./onboardingPages/objectType";
import ObjectType2 from "./onboardingPages/objectType2";



export default function Onboarding(
    { currentStep }: 
    { currentStep: number }
) {
    return (
        <>
            {currentStep === 1 && <AddObjectInfo />}
            {currentStep === 2 && <MapPointer  />}
            {currentStep === 3 && <ObjectType />}
            {currentStep === 4 && <ObjectType2 />}
            {currentStep === 5 && <ObjectSize />}
            {currentStep === 6 && <ObjectTimespan />}
        </>
    );
}
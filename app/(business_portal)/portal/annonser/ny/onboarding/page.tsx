import Onboarding from "@/app/(business_portal)/_pages/onboarding";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
    return (
        <>
            <Onboarding />
            <div className="fixed bottom-0 left-0 right-0 flex justify-between p-4 bg-white">
                <Button variant="secondary">
                    Tillbaka
                </Button>
                <Button>
                    Nästa
                </Button>
            </div>
        </>
    )
}
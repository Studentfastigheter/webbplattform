import OnboardingCoverPageShell from "@/app/(business_portal)/_components/OnboardingCoverPageShell";
import Image from "next/image";

export default function StagePublishPage() {
    return (
        <OnboardingCoverPageShell 
            stageNumber={3} 
            title="Publicera din sida" 
            description="I det här steget kommer vi publicera din sida för att göra den tillgänglig för gäster."
            image={<Image src="/campuslyan-logo.svg" alt="CampusLyan logo" width={200} height={100} />}
        />
    )
}
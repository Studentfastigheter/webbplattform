import OnboardingCoverPageShell from "@/app/(business_portal)/_components/OnboardingCoverPageShell";
import Image from "next/image";

export default function StageOptimizePage() {
    return (
        <OnboardingCoverPageShell 
            stageNumber={2} 
            title="Få ditt boende att sticka ut" 
            description="I det här steget kommer du lägga till några av de bekvämligheter ditt boende erbjuder, samt lägga till bilder, titel och beskrivning."
            image={<Image src="/campuslyan-logo.svg" alt="CampusLyan logo" width={200} height={100} />}
        />
    )
}
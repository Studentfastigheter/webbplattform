import OnboardingCoverPageShell from "@/app/(business_portal)/_components/OnboardingCoverPageShell";
import Image from "next/image";

export default function StageTellUsPage() {
    return (
        <OnboardingCoverPageShell 
            stageNumber={1} 
            title="Berätta om ditt boende" 
            description="I det här steget kommer vi fråga dig om vilken typ av boende du vill publicera och om gäster bor själva eller delat."
            image={<Image src="/campuslyan-logo.svg" alt="CampusLyan logo" width={200} height={100} />}
        />
    )
}
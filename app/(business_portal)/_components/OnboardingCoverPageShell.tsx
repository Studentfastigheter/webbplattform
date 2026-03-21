import Columns from "@/components/Dashboard/Columns";

type Props = {
    stageNumber: number,
    title: string,
    description: string,
    image: React.ReactNode
}

export default function OnboardingCoverPageShell({
    stageNumber,
    title,
    description,
    image
}: Props) {
    return (
        <div className="flex-1 flex flex-col">
            <Columns className="items-center flex-1">
                <div className="px-8 flex flex-col items-start justify-center gap-2">
                    <p className="text-sm text-neutral-600 font-medium">Steg {stageNumber}</p>
                    <h1 className="text-4xl/tight text-neutral-800 font-semibold mb-2">{title}</h1>
                    <p className="text-neutral-600">{description}</p>
                </div>
                <div className="flex items-center justify-center">
                    {image}
                </div>

            </Columns>
        </div>
    );
}
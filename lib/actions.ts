import { StatisticProps } from "@/app/(business_portal)/_statics/types";
import { AvailableStatistics, ServerFloorplan, ServerRequirementProfile } from "./definitions";
import { Eye, FileUser, MousePointerClick, ScrollText } from "lucide-react";

export async function getFloorplans() {
    // Here you would normally fetch data from a database or an API
    console.log("Fetching floorplans...");
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate async delay
    return [
        { 
            id: "seed-1", 
            displayName: "2 rok 45 kvm", 
            metadata: {
                fileName: "planlosning.pdf", 
                url: "/path/to/planlosning.pdf" 
            }
        },
    ] as ServerFloorplan[];
}

export async function submitFloorplan(
    metadata: Record<string, any>,
    itemId?: string
): Promise<{ success: boolean; id?: string }> {
    const { file, displayName } = metadata;
    
    if (!file) {
        return { success: false };
    }

    // Simulate upload with 5s delay
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Mock success
    return { 
        success: true, 
        id: itemId
    };
}

export async function getRequirementProfiles() {
    // Here you would normally fetch data from a database or an API
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate async delay
    return [
        { 
            id: "seed-1", 
            displayName: "Kravprofil 1", 
            metadata: {
                description: "Min kravprofil", 
                minAge: 0,
                maxAge: 100,
            }
        },
    ] as ServerRequirementProfile[];
}

// Data-only handler (for requirement profiles)
export async function submitRequirementProfile(
    metadata: Record<string, any>,
    itemId?: string
): Promise<{ success: boolean; id?: string }> {
    const { name, description, minimumAge, maximumAge } = metadata;

    // Simulate API call with 3s delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Here you would make the actual API call:
    // const response = await apiFetch(`/api/requirement-profiles${itemId ? `/${itemId}` : ''}`, {
    //     method: itemId ? 'PUT' : 'POST',
    //     body: JSON.stringify({ name, description, minimumAge, maximumAge }),
    // });

    // Mock success
    return { 
        success: true, 
        id: itemId
    };
}


type getStatisticsProps = {
    statisticsToFetch: AvailableStatistics[];
};

export async function getStatistics({
    statisticsToFetch,
}: getStatisticsProps) {
    // Simulate fetching statistics with delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockValues: Record<string, StatisticProps> = {
        applications: {
            Icon: FileUser,
            data: 120, 
            changeInPercent: -5.7, 
            label: "Ansökningar",
            increaseDirection: "up",
        },
        views: {
            Icon: Eye,
            data: 3400,
            changeInPercent: 1.5,
            label: "Visningar",
            increaseDirection: "up",
        },
        interactions: {
            Icon: MousePointerClick,
            data: 890,
            changeInPercent: 3.2,
            label: "Interaktioner",
            increaseDirection: "up",
        },
        active_posts: {
            Icon: ScrollText,
            data: 12,
            changeInPercent: 0.0,
            label: "Aktiva annonser",
            increaseDirection: "up",
        },
    };

    const statistics: StatisticProps[] = statisticsToFetch.map(statKey => mockValues[statKey]);

    return statistics;
}
import { AvailableStatistics, ServerFloorplan, ServerRequirementProfile } from "./definitions";

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
    const mockValues: Record<AvailableStatistics, [number, number]> = {
        applications: [120, -0.052],
        views: [1450, 0.10],
        interactions: [86, 0.8],
        active_posts: [12, 0],
    };

    return statisticsToFetch.reduce<Partial<Record<AvailableStatistics, [number, number]>>>(
        (acc, statistic) => {
            acc[statistic] = mockValues[statistic];
            return acc;
        },
        {}
    );
}
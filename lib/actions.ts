import { StatisticProps } from "@/app/(business_portal)/_statics/types";
import { Applicant, ApplicantsTableProps, Application, AvailableStatistics, ObjectDetails, ServerFloorplan, ServerRequirementProfile } from "./definitions";

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

    // Simulate upload with 1s delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success
    return { 
        success: true, 
        id: itemId
    };
}

export async function getRequirementProfiles() {
    // Here you would normally fetch data from a database or an API
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async delay
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
    await new Promise(resolve => setTimeout(resolve, 1000));

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
            iconKey: "applications",
            data: {
                "1w": 120,
                "1m": 450,
                "3m": 1300,
                "12m": 5000,
            }, 
            changeInPercent: {
                "1w": 5.0,
                "1m": 10.0,
                "3m": 15.0,
                "12m": 20.0,
            }, 
            label: "Ansökningar",
            increaseDirection: "up",
        },
        views: {
            iconKey: "views",
            data: {
                "1w": 1500,
                "1m": 6000,
                "3m": 18000,
                "12m": 72000,
            },
            changeInPercent: {
                "1w": 1.5,
                "1m": 2.0,
                "3m": 2.5,
                "12m": 3.0,
            },
            label: "Visningar",
            increaseDirection: "up",
        },
        interactions: {
            iconKey: "interactions",
            data: {
                "1w": 890,
                "1m": 3500,
                "3m": 9000,
                "12m": 40000,
            },
            changeInPercent: {
                "1w": 3.2,
                "1m": 3.5,
                "3m": 4.0,
                "12m": 4.5,
            },
            label: "Interaktioner",
            increaseDirection: "up",
        },
        active_posts: {
            iconKey: "active_posts",
            data: {
                "1w": 12,
                "1m": 11,
                "3m": 13,
                "12m": 9,
            },
            changeInPercent: {
                "1w": 0.0,
                "1m": 10.0,
                "3m": -5.0,
                "12m": 2.3,
            },
            label: "Aktiva annonser",
            increaseDirection: "up",
        },
    };

    const statistics: StatisticProps[] = statisticsToFetch.map(statKey => mockValues[statKey]);

    return statistics;
}



type getRecentApplicationsProps = {
    numberOfApplications?: number;
}

export async function getRecentApplications({
    numberOfApplications = 10,
}: getRecentApplicationsProps) {
    // Simulate fetching statistics with delay
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockApplications: Application[] = Array.from({ length: numberOfApplications }, (_, i) => ({
        id: `app-${i + 1}`,
        objectId: `obj-${Math.floor(i / 3) + 1}`,   // reuse objects a bit
        applicantId: `user-${i + 1}`,
        status: ["pending", "reviewed", "accepted", "rejected"].at(Math.floor(Math.random() * 4)) as Application["status"],
        appliedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24), // each 1 day apart
    }))


    return mockApplications;
}



type getObjectProps = {
    objectId: string;
}

export async function getObject({
    objectId,
}: getObjectProps) {
    // Simulate fetching object details with delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const object: ObjectDetails = {
        id: objectId,
        title: `Objekt ${objectId}`,
        location: ["Stockholm", "Göteborg", "Malmö"].at(Math.floor(Math.random() * 3)) as string,
        description: `Detta är en beskrivning av objektet med ID ${objectId}.`,
        applicationsCount: Math.floor(Math.random() * 100),
        floorplanId: "0",
        requirementProfileId: "0",
    };

    return object;
}


type getApplicantProps = {
    applicantId: string;
}

export async function getApplicant({
    applicantId,
}: getApplicantProps) {
    // Simulate fetching applicant details with delay
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    const applicant: Applicant = {
        id: applicantId,
        applicantName: `Sökande ${applicantId}`,
        applicantAge: 18 + Math.floor(Math.random() * 10),
        applicantEmail: `${applicantId}@example.com`,
        applicantPhone: `070-${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    return applicant;
}


type getApplicantsTableDataProps = {
    page?: number;
    pageSize?: number;
}

export async function getApplicantsTableData({
    page = 1,
    pageSize = 20,
}: getApplicantsTableDataProps): Promise<ApplicantsTableProps[]> {

    const applicationsPromise = getRecentApplications({ numberOfApplications: pageSize });
    const applicantsTableDataPromise = applicationsPromise.then(applications => {
        return Promise.all(applications.map(async (application) => {
            const applicant = await getApplicant({ applicantId: application.applicantId });
            const object = await getObject({ objectId: application.objectId });
            return {
                id: application.id,
                objectId: "1",
                applicantName: applicant.applicantName,
                applicantAge: applicant.applicantAge,
                applicantEmail: applicant.applicantEmail,
                applicantPhone: applicant.applicantPhone,
                objectTitle: object.title,
                status: application.status,
                appliedAt: application.appliedAt,
            }
        }));
    });

    return applicantsTableDataPromise;
}

export async function getMostAppliedObjects() {
    // Simulate fetching data with delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mostAppliedObjects: ObjectDetails[] = Array.from({ length: 5 }, (_, i) => ({
        id: `obj-${i + 1}`,
        title: `Objekt ${i + 1}`,
        description: `Detta är en beskrivning av objektet med ID ${i + 1}.`,
        location: ["Stockholm", "Göteborg", "Malmö"].at(Math.floor(Math.random() * 3)) as string,
        applicationsCount: Math.floor(Math.random() * 100),
        floorplanId: "0",
        requirementProfileId: "0",
    }));

    return mostAppliedObjects;

}
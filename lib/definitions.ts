export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export type FileCardClientItem<T = Record<string, any>> = {
    id: string;
    displayName: string;
    status: "default" | "uploading" | "error";
    errorMessage?: string;
    metadata: T; // Form data
};

export type FileCardServerItem<T = Record<string, any>> = {
    id: string;
    displayName: string;
    metadata? : T;
}

export type ServerFloorplan = FileCardServerItem<{
    fileName: string;
    url: string;
}>

export type ServerRequirementProfile = FileCardServerItem<{
    description: string;
    minAge: number;
    maxAge: number;
}>



export type SkeletonWrapperProps = {
    gap: "sm" | "md" | "lg";
    count: number;
    children: React.ReactNode;
}

export type AvailableStatistics = "applications" | "views" | "interactions" | "active_posts";





export type ApplicationStatus = "pending" | "reviewed" | "rejected" | "accepted";

export type Applicant = {
    id: string;
    applicantName: string;
    applicantAge: number;
    applicantEmail: string;
    applicantPhone: string;
}

export type Application = {
    id: string;
    objectId: string;
    applicantId: string;
    status: ApplicationStatus;
    appliedAt: Date;
}



export type ObjectDetails = {
    id: string;
    title: string;
    description: string;
    location: string;
    floorplanId?: string;
    requirementProfileId?: string;
}



export type ApplicantsTableProps = Omit<Application & Applicant, "applicantId">;
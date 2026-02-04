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
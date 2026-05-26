import { API_BASE, apiClient, pathSegment } from "@/lib/api/client";

export const mediaService = {
  listCompanyPublic: async (companyId: number | string): Promise<string[]> => {
    const files = await apiClient<unknown>(
      `/media/company/${pathSegment(companyId)}/public`,
      { auth: false }
    );

    return Array.isArray(files)
      ? files.filter((file): file is string => typeof file === "string")
      : [];
  },

  companyPublicUrl: (companyId: number | string, filename: string): string => {
    return `${API_BASE}/media/company/${pathSegment(companyId)}/public/${pathSegment(
      filename
    )}`;
  },

  downloadCompanyPublic: async (
    companyId: number | string,
    filename: string
  ): Promise<Blob> => {
    return apiClient<Blob>(
      `/media/company/${pathSegment(companyId)}/public/${pathSegment(filename)}`,
      {
        auth: false,
        responseType: "blob",
      }
    );
  },
};

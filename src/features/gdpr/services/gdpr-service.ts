import { apiClient, buildQuery, pathSegment } from "@/lib/api/client";

export type RequestGdprAccessRequestDTO = {
  password: string;
};

export type RequestGdprAccessResponseDTO = {
  accessId: string;
  validTo: string;
};

export const gdprService = {
  requestAccess: async (
    payload: RequestGdprAccessRequestDTO
  ): Promise<RequestGdprAccessResponseDTO> => {
    return apiClient<RequestGdprAccessResponseDTO>("/gdpr/request", {
      method: "POST",
      body: JSON.stringify({ password: payload.password }),
    });
  },

  getInformationText: async (
    accessId: string,
    type: "txt" = "txt"
  ): Promise<string> => {
    return apiClient<string>(
      `/gdpr/${pathSegment(accessId)}/INFORMATION.txt${buildQuery({ type })}`,
      {
        responseType: "text",
      }
    );
  },

  getInformationZip: async (
    accessId: string,
    type: "txt" = "txt"
  ): Promise<Blob> => {
    return apiClient<Blob>(
      `/gdpr/${pathSegment(accessId)}/INFORMATION.zip${buildQuery({ type })}`,
      {
        responseType: "blob",
      }
    );
  },
};

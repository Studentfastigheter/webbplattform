import { apiClient, buildQuery, pathSegment } from "@/lib/api-client";

export type DocumentPropagationCompanyResult =
  | string
  | {
  companyId?: string | number;
  companyName?: string;
  name?: string;
  externalId?: string;
  success?: boolean;
  succeeded?: boolean;
  message?: string;
  error?: string;
};

export type DocumentPropagationResult = {
  total?: number;
  totalCompanies?: number;
  successCount?: number;
  succeededCount?: number;
  failureCount?: number;
  failedCount?: number;
  succeeded?: DocumentPropagationCompanyResult[];
  successful?: DocumentPropagationCompanyResult[];
  successes?: DocumentPropagationCompanyResult[];
  successfulCompanies?: DocumentPropagationCompanyResult[];
  failed?: DocumentPropagationCompanyResult[];
  failures?: DocumentPropagationCompanyResult[];
  failedCompanies?: DocumentPropagationCompanyResult[];
  errors?: DocumentPropagationCompanyResult[];
  message?: string;
};

export const documentService = {
  upload: async (
    file: File,
    options: {
      contentType?: string;
      mock?: boolean;
      signal?: AbortSignal;
    } = {}
  ): Promise<DocumentPropagationResult> => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const query = buildQuery({
      contentType: options.contentType ?? file.type ?? "application/octet-stream",
      mock: options.mock,
    });

    return await apiClient<DocumentPropagationResult>(
      `/documents/upload${query}`,
      {
        method: "POST",
        body: formData,
        signal: options.signal,
      }
    );
  },

  list: async (): Promise<string[]> => {
    const documents = await apiClient<unknown>("/documents/list");
    return Array.isArray(documents)
      ? documents.filter((document): document is string => typeof document === "string")
      : [];
  },

  download: async (
    documentName: string,
    options: { mock?: boolean } = {}
  ): Promise<Blob> => {
    const query = buildQuery({ mock: options.mock });
    return apiClient<Blob>(
      `/documents/byname/${pathSegment(documentName)}${query}`,
      { responseType: "blob" }
    );
  },

  delete: async (
    documentName: string,
    options: { mock?: boolean } = {}
  ): Promise<void> => {
    const query = buildQuery({ mock: options.mock });
    await apiClient<void>(`/documents/byname/${pathSegment(documentName)}${query}`, {
      method: "DELETE",
    });
  },

  legacy: {
    upload: async (
      file: File,
      options: { contentType?: string; signal?: AbortSignal } = {}
    ): Promise<DocumentPropagationResult> => {
      const formData = new FormData();
      formData.append("file", file, file.name);

      const query = buildQuery({
        contentType: options.contentType ?? file.type ?? "application/octet-stream",
      });

      return apiClient<DocumentPropagationResult>(
        `/documents/legacy/upload${query}`,
        {
          method: "POST",
          body: formData,
          signal: options.signal,
        }
      );
    },

    list: async (): Promise<string[]> => {
      const documents = await apiClient<unknown>("/documents/legacy/list");
      return Array.isArray(documents)
        ? documents.filter((document): document is string => typeof document === "string")
        : [];
    },

    download: async (documentName: string): Promise<Blob> => {
      return apiClient<Blob>(
        `/documents/legacy/byname/${pathSegment(documentName)}`,
        { responseType: "blob" }
      );
    },

    delete: async (documentName: string): Promise<void> => {
      await apiClient<void>(
        `/documents/legacy/byname/${pathSegment(documentName)}`,
        { method: "DELETE" }
      );
    },
  },
};

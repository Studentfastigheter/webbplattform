import { apiClient, buildQuery } from "@/lib/api-client";

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
    options: { signal?: AbortSignal } = {}
  ): Promise<DocumentPropagationResult> => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const query = buildQuery({
      contentType: file.type || "application/octet-stream",
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
};

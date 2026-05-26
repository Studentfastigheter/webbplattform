import { apiClient, buildQuery, pathSegment } from "@/lib/api/client";

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

export type UploadedDocument = {
  name: string;
  title?: string;
  note?: string;
  size?: number;
  contentType?: string;
  mimeType?: string;
  uploadedAt?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringValue = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const numberValue = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

function normalizeUploadedDocument(value: unknown): UploadedDocument | null {
  if (typeof value === "string") {
    return value.trim().length > 0 ? { name: value.trim() } : null;
  }

  if (!isRecord(value)) return null;

  const name =
    stringValue(value.name) ??
    stringValue(value.fileName) ??
    stringValue(value.filename) ??
    stringValue(value.documentName) ??
    stringValue(value.originalName);

  if (!name) return null;

  return {
    name,
    title: stringValue(value.title),
    note: stringValue(value.note),
    size:
      numberValue(value.size) ??
      numberValue(value.fileSize) ??
      numberValue(value.contentLength),
    contentType: stringValue(value.contentType),
    mimeType: stringValue(value.mimeType),
    uploadedAt:
      stringValue(value.uploadedAt) ??
      stringValue(value.createdAt) ??
      stringValue(value.lastModified),
  };
}

function normalizeUploadedDocuments(value: unknown): UploadedDocument[] {
  if (Array.isArray(value)) {
    return value
      .map(normalizeUploadedDocument)
      .filter((document): document is UploadedDocument => document !== null);
  }

  if (!isRecord(value)) return [];

  for (const key of ["documents", "content", "items", "data", "results"]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested
        .map(normalizeUploadedDocument)
        .filter((document): document is UploadedDocument => document !== null);
    }
  }

  const singleDocument = normalizeUploadedDocument(value);
  return singleDocument ? [singleDocument] : [];
}

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

  list: async (): Promise<UploadedDocument[]> => {
    const documents = await apiClient<unknown>("/documents/list");
    return normalizeUploadedDocuments(documents);
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
      return documentService.upload(file, options);
    },

    list: async (): Promise<string[]> => {
      const documents = await documentService.list();
      return documents.map((document) => document.name);
    },

    download: async (documentName: string): Promise<Blob> => {
      return documentService.download(documentName);
    },

    delete: async (documentName: string): Promise<void> => {
      await documentService.delete(documentName);
    },
  },
};

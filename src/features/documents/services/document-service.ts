import { apiClient, buildQuery, pathSegment } from "@/lib/api/client";
import type { DocumentFileType, SystemProvider } from "@/types/common";

export type UploadDocumentTargetDTO = {
  systemProvider: SystemProvider;
  externalId: string;
};

export type DocumentRequestTypeDTO = UploadDocumentTargetDTO & {
  caption?: string;
  description?: string;
  allowedTypes?: Array<DocumentFileType | string>;
};

export type ShareDocumentResultDTO = UploadDocumentTargetDTO & {
  validForDays?: number | null;
};

export type ShareDocumentFailureDTO = UploadDocumentTargetDTO & {
  statusCode?: number;
  reason?: string;
};

export type UploadDocumentResultDTO = {
  success?: boolean;
  filesystemId?: string;
  sharedWith?: ShareDocumentResultDTO[];
  failedFor?: ShareDocumentFailureDTO[];
};

export type ExternalDeleteDocumentResultDTO = UploadDocumentTargetDTO;

export type ExternalDeleteDocumentFailureDTO = UploadDocumentTargetDTO & {
  statusCode?: number;
  reason?: string;
};

export type DeleteDocumentResultDTO = {
  success?: boolean;
  localDeleteResult?: "success" | "failure" | "notPresent";
  succeededFor?: ExternalDeleteDocumentResultDTO[];
  failedFor?: ExternalDeleteDocumentFailureDTO[];
  totalFailure?: boolean;
  complete?: boolean;
};

export type SharedUserDocumentDTO = UploadDocumentTargetDTO & {
  expired?: boolean;
  validForDays?: number | null;
  remaningValidDays?: number | null;
};

export type UserDocumentDTO = {
  filesystemId: string;
  expired?: boolean;
  documentType?: DocumentFileType | string;
  sharedWith?: SharedUserDocumentDTO[];
  notSharedWith?: UploadDocumentTargetDTO[];
};

export type DocumentPropagationCompanyResult =
  | string
  | ShareDocumentResultDTO
  | ShareDocumentFailureDTO;

export type DocumentPropagationResult = UploadDocumentResultDTO & {
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
  expired?: boolean;
  filesystemId?: string;
  documentType?: DocumentFileType | string;
  sharedWith?: SharedUserDocumentDTO[];
  notSharedWith?: UploadDocumentTargetDTO[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringValue = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

function normalizeUserDocument(value: unknown): UploadedDocument | null {
  if (!isRecord(value)) return null;

  const filesystemId = stringValue(value.filesystemId);
  if (!filesystemId) return null;

  return {
    name: filesystemId,
    title: stringValue(value.documentType) ?? "Dokument",
    filesystemId,
    documentType: stringValue(value.documentType),
    expired: typeof value.expired === "boolean" ? value.expired : undefined,
    sharedWith: Array.isArray(value.sharedWith)
      ? (value.sharedWith as SharedUserDocumentDTO[])
      : [],
    notSharedWith: Array.isArray(value.notSharedWith)
      ? (value.notSharedWith as UploadDocumentTargetDTO[])
      : [],
  };
}

function normalizeUploadedDocuments(value: unknown): UploadedDocument[] {
  if (Array.isArray(value)) {
    return value
      .map(normalizeUserDocument)
      .filter((document): document is UploadedDocument => document !== null);
  }

  if (!isRecord(value)) return [];

  for (const key of ["content", "items", "data", "results", "documents"]) {
    const nested = value[key];
    if (Array.isArray(nested)) {
      return nested
        .map(normalizeUserDocument)
        .filter((document): document is UploadedDocument => document !== null);
    }
  }

  const singleDocument = normalizeUserDocument(value);
  return singleDocument ? [singleDocument] : [];
}

function normalizeUploadResult(value: UploadDocumentResultDTO): DocumentPropagationResult {
  const sharedWith = value.sharedWith ?? [];
  const failedFor = value.failedFor ?? [];

  return {
    ...value,
    succeeded: sharedWith,
    successful: sharedWith,
    successes: sharedWith,
    successfulCompanies: sharedWith,
    failed: failedFor,
    failures: failedFor,
    failedCompanies: failedFor,
    errors: failedFor,
    successCount: sharedWith.length,
    succeededCount: sharedWith.length,
    failureCount: failedFor.length,
    failedCount: failedFor.length,
    message:
      value.success === false
        ? "Dokumentet laddades upp men kunde inte skickas till alla mottagare."
        : "Dokumentet laddades upp.",
  };
}

export const documentService = {
  getUploadTargets: async (): Promise<DocumentRequestTypeDTO[]> => {
    const targets = await apiClient<unknown>("/documents/upload-target", {
      auth: false,
    });
    return Array.isArray(targets)
      ? (targets as DocumentRequestTypeDTO[])
      : [];
  },

  getUploadTarget: async (
    provider: SystemProvider,
    id: string
  ): Promise<DocumentRequestTypeDTO> => {
    return apiClient<DocumentRequestTypeDTO>(
      `/documents/upload-target/${pathSegment(provider)}/${pathSegment(id)}`,
      { auth: false }
    );
  },

  upload: async (
    file: File,
    options: {
      targets?: UploadDocumentTargetDTO[];
      type?: DocumentFileType;
      signal?: AbortSignal;
    } = {}
  ): Promise<DocumentPropagationResult> => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const query = buildQuery({
      targets: JSON.stringify(options.targets ?? []),
      type: options.type,
    });

    const result = await apiClient<UploadDocumentResultDTO>(
      `/documents/document/upload${query}`,
      {
        method: "POST",
        body: formData,
        signal: options.signal,
      }
    );

    return normalizeUploadResult(result);
  },

  list: async (): Promise<UploadedDocument[]> => {
    const documents = await apiClient<unknown>("/documents/document/info");
    return normalizeUploadedDocuments(documents);
  },

  getInfo: async (filesystemId: string): Promise<UserDocumentDTO> => {
    return apiClient<UserDocumentDTO>(
      `/documents/document/info/${pathSegment(filesystemId)}`
    );
  },

  download: async (_filesystemId: string): Promise<Blob> => {
    throw new Error("Swagger-dokumentationen exponerar ingen download-endpoint för privata dokument.");
  },

  delete: async (filesystemId: string): Promise<DeleteDocumentResultDTO> => {
    return apiClient<DeleteDocumentResultDTO>(
      `/documents/document/${pathSegment(filesystemId)}`,
      {
        method: "DELETE",
      }
    );
  },

  legacy: {
    upload: async (
      file: File,
      options: { signal?: AbortSignal } = {}
    ): Promise<DocumentPropagationResult> => {
      return documentService.upload(file, options);
    },

    list: async (): Promise<string[]> => {
      const documents = await documentService.list();
      return documents.map((document) => document.name);
    },

    download: async (filesystemId: string): Promise<Blob> => {
      return documentService.download(filesystemId);
    },

    delete: async (filesystemId: string): Promise<void> => {
      await documentService.delete(filesystemId);
    },
  },
};

import { ApiError, apiClient, buildQuery, pathSegment } from "@/lib/api/client";
import { isRecord } from "@/lib/api/normalize";
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

export type StudentDocumentFileInfoDTO = {
  id?: string;
  filesystemId?: string;
  documentId?: string;
  documentType?: DocumentFileType | string;
  mediaType?: string;
  originalFilename?: string;
  createdAt?: string;
  updatedAt?: string;
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
  mediaType?: string;
  originalFilename?: string;
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
  documentId?: string;
  documentType?: DocumentFileType | string;
  sharedWith?: SharedUserDocumentDTO[];
  notSharedWith?: UploadDocumentTargetDTO[];
};

const stringValue = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

function normalizeUserDocument(value: unknown): UploadedDocument | null {
  if (!isRecord(value)) return null;

  const filesystemId =
    stringValue(value.filesystemId) ??
    stringValue(value.id) ??
    stringValue(value.documentId);
  if (!filesystemId) return null;

  const originalFilename =
    stringValue(value.originalFilename) ??
    stringValue(value.name) ??
    stringValue(value.filename);

  return {
    name: originalFilename ?? filesystemId,
    title:
      originalFilename ??
      stringValue(value.documentType) ??
      "Dokument",
    filesystemId,
    documentId: filesystemId,
    documentType: stringValue(value.documentType),
    contentType: stringValue(value.mediaType),
    mimeType: stringValue(value.mediaType),
    uploadedAt: stringValue(value.createdAt) ?? stringValue(value.updatedAt),
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

function normalizeStudentUploadResult(
  value: StudentDocumentFileInfoDTO
): DocumentPropagationResult {
  const filesystemId = value.filesystemId ?? value.id ?? value.documentId;

  return {
    success: true,
    filesystemId,
    sharedWith: [],
    failedFor: [],
    succeeded: [],
    successful: [],
    successes: [],
    successfulCompanies: [],
    failed: [],
    failures: [],
    failedCompanies: [],
    errors: [],
    successCount: 0,
    succeededCount: 0,
    failureCount: 0,
    failedCount: 0,
    message: "Dokumentet laddades upp.",
  };
}

async function uploadAndPropagate(
  file: File,
  options: {
    targets?: UploadDocumentTargetDTO[];
    type?: DocumentFileType;
    signal?: AbortSignal;
  } = {}
): Promise<DocumentPropagationResult> {
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
}

async function listPropagatedDocuments(): Promise<UploadedDocument[]> {
  const documents = await apiClient<unknown>("/documents/document/info");
  return normalizeUploadedDocuments(documents);
}

async function deletePropagatedDocument(
  filesystemId: string
): Promise<DeleteDocumentResultDTO> {
  return apiClient<DeleteDocumentResultDTO>(
    `/documents/document/${pathSegment(filesystemId)}`,
    {
      method: "DELETE",
    }
  );
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
      name?: string;
      signal?: AbortSignal;
    } = {}
  ): Promise<DocumentPropagationResult> => {
    if (options.targets && options.targets.length > 0) {
      return uploadAndPropagate(file, options);
    }

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("name", options.name?.trim() || file.name);

    const result = await apiClient<StudentDocumentFileInfoDTO>(
      "/me/documents",
      {
        method: "POST",
        body: formData,
        signal: options.signal,
      }
    );

    return normalizeStudentUploadResult(result);
  },

  list: async (): Promise<UploadedDocument[]> => {
    try {
      const documents = await apiClient<unknown>("/me/documents");
      return normalizeUploadedDocuments(documents);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return listPropagatedDocuments();
      }

      throw error;
    }
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
    try {
      await apiClient<void>(`/me/documents/${pathSegment(filesystemId)}`, {
        method: "DELETE",
      });

      return {
        success: true,
        localDeleteResult: "success",
        succeededFor: [],
        failedFor: [],
        totalFailure: false,
        complete: true,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return deletePropagatedDocument(filesystemId);
      }

      throw error;
    }
  },

  listStudentDocuments: async (studentId: number | string): Promise<UploadedDocument[]> => {
    const documents = await apiClient<unknown>(
      `/students/${pathSegment(studentId)}/documents`
    );
    return normalizeUploadedDocuments(documents);
  },

  getStudentDocumentDownloadUrl: async (
    studentId: number | string,
    documentId: string
  ): Promise<string> => {
    const response = await apiClient<{ url?: string }>(
      `/students/${pathSegment(studentId)}/documents/${pathSegment(documentId)}/download`
    );

    if (!response.url) {
      throw new Error("Backend returnerade ingen nedladdningslänk.");
    }

    return response.url;
  },

  downloadStudentDocument: async (
    studentId: number | string,
    documentId: string
  ): Promise<Blob> => {
    const url = await documentService.getStudentDocumentDownloadUrl(
      studentId,
      documentId
    );
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Kunde inte ladda ner dokumentet.");
    }

    return response.blob();
  },

  legacy: {
    upload: async (
      file: File,
      options: { signal?: AbortSignal } = {}
    ): Promise<DocumentPropagationResult> => {
      return uploadAndPropagate(file, options);
    },

    list: async (): Promise<string[]> => {
      const documents = await listPropagatedDocuments();
      return documents.map((document) => document.name);
    },

    download: async (filesystemId: string): Promise<Blob> => {
      return documentService.download(filesystemId);
    },

    delete: async (filesystemId: string): Promise<void> => {
      await deletePropagatedDocument(filesystemId);
    },
  },
};

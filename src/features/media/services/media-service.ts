import {
  API_BASE,
  apiClient,
  buildQuery,
  pathSegment,
  type ServiceOptions,
} from "@/lib/api/client";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const firstString = (...values: unknown[]) =>
  values.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  )?.trim();

function companyPublicUrl(companyId: number | string, filename: string): string {
  return `${API_BASE}/media/company/${pathSegment(companyId)}/public/${pathSegment(
    filename
  )}`;
}

function externalCompanyPublicUrl(
  externalCompanyId: number | string,
  filename: string
): string {
  return `${API_BASE}/media/external-company/${pathSegment(
    externalCompanyId
  )}/public/${pathSegment(filename)}`;
}

function normalizeMediaUrlString(
  value: string,
  companyId?: number | string
): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.startsWith("\"")) {
    try {
      return normalizeUploadedMediaUrl(JSON.parse(trimmed), companyId);
    } catch {
      // Keep treating the response as a plain URL below.
    }
  }

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return normalizeMediaUrlString(trimmed.slice(1, -1), companyId);
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("/api/media/")) {
    return `${API_BASE}${trimmed.slice("/api".length)}`;
  }

  if (trimmed.startsWith("/media/")) {
    return `${API_BASE}${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed.includes("/")) {
    const normalizedPath = trimmed.replace(/^\/+/, "").replace(/^api\//, "");
    return `${API_BASE}/${normalizedPath}`;
  }

  return companyId != null ? companyPublicUrl(companyId, trimmed) : trimmed;
}

function normalizeUploadedMediaUrl(
  value: unknown,
  companyId?: number | string
): string | null {
  if (typeof value === "string") {
    return normalizeMediaUrlString(value, companyId);
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const url = normalizeUploadedMediaUrl(entry, companyId);
      if (url) return url;
    }

    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const directUrl = firstString(
    value.url,
    value.publicUrl,
    value.mediaUrl,
    value.imageUrl,
    value.fileUrl,
    value.downloadUrl,
    value.location,
    value.href,
    value.link,
    value.path
  );

  if (directUrl) {
    return normalizeMediaUrlString(directUrl, companyId);
  }

  const filename = firstString(value.filename, value.fileName, value.name);
  if (filename && companyId != null) {
    return companyPublicUrl(companyId, filename);
  }

  return normalizeUploadedMediaUrl(value.data ?? value.result ?? value.payload, companyId);
}

export const mediaService = {
  listCompanyPublic: async (
    companyId: number | string,
    options?: ServiceOptions
  ): Promise<string[]> => {
    const files = await apiClient<unknown>(
      `/media/company/${pathSegment(companyId)}/public`,
      { auth: false, signal: options?.signal }
    );

    return Array.isArray(files)
      ? files.filter((file): file is string => typeof file === "string")
      : [];
  },

  companyPublicUrl: (companyId: number | string, filename: string): string => {
    return companyPublicUrl(companyId, filename);
  },

  externalCompanyPublicUrl: (
    externalCompanyId: number | string,
    filename: string
  ): string => {
    return externalCompanyPublicUrl(externalCompanyId, filename);
  },

  uploadCompanyPublic: async (
    companyId: number | string,
    file: File,
    options: { mediaType?: string } = {}
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const response = await apiClient<unknown>(
      `/media/company/${pathSegment(companyId)}/public${buildQuery({
        mediaType: options.mediaType,
      })}`,
      {
        method: "POST",
        body: formData,
      }
    );
    const uploadedUrl = normalizeUploadedMediaUrl(response, companyId);

    if (!uploadedUrl) {
      throw new Error("Kunde inte tolka lanken fran bilduppladdningen.");
    }

    return uploadedUrl;
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

  downloadExternalCompanyPublic: async (
    externalCompanyId: number | string,
    filename: string
  ): Promise<Blob> => {
    return apiClient<Blob>(
      `/media/external-company/${pathSegment(
        externalCompanyId
      )}/public/${pathSegment(filename)}`,
      {
        auth: false,
        responseType: "blob",
      }
    );
  },
};

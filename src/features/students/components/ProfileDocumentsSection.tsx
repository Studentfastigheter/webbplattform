"use client";

import {
  Fragment,
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from "react";
import { Download01, Edit03, Eye, File05, XClose } from "@/components/icons";

import {
  FileUpload,
  type FileListItemProps,
} from "@/components/application/file-upload/file-upload-base";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextParagraph } from "@/components/ui/RichText";
import { Textarea } from "@/components/ui/textarea";
import { cx } from "@/lib/utils/cx";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { formatLocalizedDateTime, localizedText } from "@/i18n/text";
import {
  documentService,
  type DocumentPropagationResult,
  type UploadedDocument,
} from "@/features/documents/services/document-service";
import {
  useDeleteDocument,
  useMyDocuments,
  useUploadDocument,
} from "@/features/documents/hooks/useDocuments";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf";

type FileIconType = FileListItemProps["type"];
type BaseButtonProps = ComponentProps<typeof Button>;

type StudentDocument = {
  id: string;
  title: string;
  note?: string;
  name: string;
  file?: File;
  size: number;
  type?: FileIconType;
  mimeType?: string;
  progress: number;
  failed?: boolean;
  errorMessage?: string;
  propagationResult?: DocumentPropagationResult;
  uploadedAt?: string;
  objectUrl?: string;
  downloadUrl?: string;
};

type EditDraft = {
  title: string;
  note: string;
};

type StatusMessage =
  | string
  | {
      tone: "success" | "warning" | "error";
      text: string;
    };

const emptyEditDraft: EditDraft = {
  title: "",
  note: "",
};

const buttonClassName =
  "rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-none hover:bg-gray-50";

const destructiveButtonClassName =
  "rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-none hover:bg-red-50";

const dropZoneClassName =
  "rounded-lg border border-dashed border-gray-300 bg-gray-50/70 text-gray-500 ring-0 transition-colors hover:border-[#004225]/50 hover:bg-white [&_.text-error-primary]:text-red-600 [&_button]:text-[#004225]";

const uploadListItemClassName =
  "rounded-lg bg-white ring-gray-200 shadow-sm [&_.bg-fg-brand-primary]:bg-[#004225] [&_.bg-quaternary]:bg-gray-100 [&_.text-fg-quaternary]:text-gray-400 [&_.text-fg-success-primary]:text-emerald-600 [&_.text-quaternary]:text-gray-500 [&_.text-secondary]:text-gray-900 [&_.text-success-primary]:text-emerald-700 [&_.text-tertiary]:text-gray-500";

const startUploadProgress = (onProgress: (progress: number) => void) => {
  let progress = 8;

  onProgress(progress);

  const interval = window.setInterval(() => {
    progress = Math.min(progress + 8, 90);
    onProgress(progress);
  }, 180);

  return () => window.clearInterval(interval);
};

function titleFromFileName(fileName: string) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return nameWithoutExtension.trim() || fileName;
}

function getFileIconType(file: File): FileIconType {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "pdf";
  if (extension === "doc" || extension === "docx") return "doc";
  if (extension === "jpg" || extension === "jpeg") return "jpg";
  if (extension === "png") return "png";

  return "empty";
}

function getFileListItemType(document: StudentDocument): FileIconType {
  if (document.type) return document.type;

  const extension = document.name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (extension === "doc" || extension === "docx") return "doc";
  if (extension === "jpg" || extension === "jpeg") return "jpg";
  if (extension === "png") return "png";

  return "empty";
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getDocumentHref(document: StudentDocument) {
  return document.objectUrl ?? document.downloadUrl;
}

function isPdfDocument(document: StudentDocument) {
  return (
    document.mimeType === "application/pdf" ||
    getFileExtension(document.name) === "pdf"
  );
}

function isImageDocument(document: StudentDocument) {
  const extension = getFileExtension(document.name);

  return (
    document.mimeType?.startsWith("image/") ||
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png"
  );
}

function formatUploadedAt(value: string, locale: Locale) {
  return formatLocalizedDateTime(locale, value);
}

const successResultKeys = [
  "succeeded",
  "successful",
  "successes",
  "successfulCompanies",
] as const;
const failureResultKeys = [
  "failed",
  "failures",
  "failedCompanies",
  "errors",
] as const;

function getPropagationList(
  result: DocumentPropagationResult,
  keys: readonly (keyof DocumentPropagationResult)[]
) {
  for (const key of keys) {
    const value = result[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function getPropagationCount(
  result: DocumentPropagationResult,
  countKeys: readonly (keyof DocumentPropagationResult)[],
  listKeys: readonly (keyof DocumentPropagationResult)[]
) {
  for (const key of countKeys) {
    const value = result[key];
    if (typeof value === "number") return value;
  }

  const list = getPropagationList(result, listKeys);
  return list.length > 0 ? list.length : undefined;
}

function getPropagationSummary(result: DocumentPropagationResult | undefined, locale: Locale) {
  if (!result) return null;

  const successCount = getPropagationCount(
    result,
    ["successCount", "succeededCount"],
    successResultKeys
  );
  const failureCount = getPropagationCount(
    result,
    ["failureCount", "failedCount"],
    failureResultKeys
  );

  if (successCount !== undefined || failureCount !== undefined) {
    const successes = successCount ?? 0;
    const failures = failureCount ?? 0;

    if (failures > 0) {
      return localizedText(
        locale,
        `${successes} bolag tog emot dokumentet, ${failures} misslyckades.`,
        `${successes} companies received the document, ${failures} failed.`,
      );
    }

    if (successes > 0) {
      return localizedText(locale, `Dokumentet skickades till ${successes} bolag.`, `The document was sent to ${successes} companies.`);
    }

    return localizedText(locale, "Dokumentet laddades upp, men inga mottagare rapporterades.", "The document was uploaded, but no recipients were reported.");
  }

  return result.message ?? localizedText(locale, "Dokumentet laddades upp till backend.", "The document was uploaded to the backend.");
}

function hasPropagationFailures(result?: DocumentPropagationResult) {
  if (!result) return false;

  const failureCount = getPropagationCount(
    result,
    ["failureCount", "failedCount"],
    failureResultKeys
  );

  return typeof failureCount === "number" && failureCount > 0;
}

function getUploadErrorMessage(error: unknown, locale: Locale) {
  if (error instanceof Error && error.message) return error.message;
  return localizedText(locale, "Kunde inte ladda upp dokumentet till backend.", "Could not upload the document to the backend.");
}

function createDocumentFromFile(file: File): StudentDocument {
  return {
    id: crypto.randomUUID(),
    title: titleFromFileName(file.name),
    name: file.name,
    file,
    size: file.size,
    type: getFileIconType(file),
    mimeType: file.type,
    progress: 0,
    uploadedAt: new Date().toISOString(),
    objectUrl: URL.createObjectURL(file),
  };
}

function createDocumentFromUploaded(document: UploadedDocument): StudentDocument {
  return {
    id: crypto.randomUUID(),
    title: document.title ?? titleFromFileName(document.name),
    note: document.note,
    name: document.name,
    size: document.size ?? 0,
    mimeType: document.mimeType ?? document.contentType,
    progress: 100,
    uploadedAt: document.uploadedAt,
  };
}

export default function ProfileDocumentsSection() {
  const { locale } = useI18n();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  // `documents` is local state because uploads add transient items (with
  // progress) before they exist server-side. We seed and merge from the
  // useMyDocuments cache via the effect below.
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyEditDraft);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
    null
  );
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  );
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null);
  const [previewLoadingDocumentId, setPreviewLoadingDocumentId] = useState<
    string | null
  >(null);

  const objectUrlsRef = useRef<Set<string>>(new Set());
  const uploadCleanupsRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    return () => {
      uploadCleanupsRef.current.forEach((cleanup) => cleanup());
      uploadCleanupsRef.current.clear();

      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  // Documents server cache. Mutations (upload/delete) will invalidate this
  // key in Phase 2; for now we read it and merge into local `documents`
  // state below.
  const {
    data: uploadedDocuments,
    isLoading: isLoadingDocuments,
    isError: isDocumentsError,
    error: documentsErr,
  } = useMyDocuments();

  useEffect(() => {
    if (isDocumentsError) {
      setMessage({
        tone: "error",
        text:
          documentsErr instanceof Error
            ? documentsErr.message
            : localizedText(locale, "Kunde inte hämta uppladdade dokument.", "Could not load uploaded documents."),
      });
      return;
    }
    if (!uploadedDocuments) return;
    const loadedDocuments = uploadedDocuments.map(createDocumentFromUploaded);
    setDocuments((current) => {
      if (current.length === 0) return loadedDocuments;
      const currentNames = new Set(current.map((document) => document.name));
      return [
        ...current,
        ...loadedDocuments.filter(
          (document) => !currentNames.has(document.name)
        ),
      ];
    });
  }, [uploadedDocuments, isDocumentsError, documentsErr, locale]);

  const previewDocument =
    documents.find((document) => document.id === previewDocumentId) ?? null;

  useEffect(() => {
    if (!previewDocument) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewDocumentId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewDocument]);

  const revokeObjectUrl = (objectUrl?: string) => {
    if (!objectUrl) return;
    URL.revokeObjectURL(objectUrl);
    objectUrlsRef.current.delete(objectUrl);
  };

  const setDocumentProgress = (documentId: string, progress: number) => {
    setDocuments((current) =>
      current.map((item) =>
        item.id === documentId ? { ...item, progress } : item
      )
    );
  };

  const getBackendDocumentUrl = async (documentName: string) => {
    const blob = await documentService.download(documentName);
    const objectUrl = URL.createObjectURL(blob);
    objectUrlsRef.current.add(objectUrl);
    return objectUrl;
  };

  const cacheDocumentDownloadUrl = (documentId: string, downloadUrl: string) => {
    setDocuments((current) =>
      current.map((item) =>
        item.id === documentId ? { ...item, downloadUrl } : item
      )
    );
  };

  const triggerBrowserDownload = (href: string, fileName: string) => {
    const link = window.document.createElement("a");
    link.href = href;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const uploadDocumentToBackend = async (documentId: string, file: File) => {
    uploadCleanupsRef.current.get(documentId)?.();
    uploadCleanupsRef.current.delete(documentId);

    setDocuments((current) =>
      current.map((item) =>
        item.id === documentId
          ? {
              ...item,
              failed: false,
              errorMessage: undefined,
              propagationResult: undefined,
              progress: 0,
            }
          : item
      )
    );

    const controller = new AbortController();
    const stopProgress = startUploadProgress((progress) =>
      setDocumentProgress(documentId, progress)
    );
    const cleanupUpload = () => {
      stopProgress();
      controller.abort();
    };

    uploadCleanupsRef.current.set(documentId, cleanupUpload);

    try {
      const result = await uploadDocument.mutateAsync({
        file,
        signal: controller.signal,
      });

      stopProgress();
      if (uploadCleanupsRef.current.get(documentId) === cleanupUpload) {
        uploadCleanupsRef.current.delete(documentId);
      }

      setDocuments((current) =>
        current.map((item) =>
          item.id === documentId
            ? {
                ...item,
                failed: false,
                errorMessage: undefined,
                propagationResult: result,
                progress: 100,
              }
            : item
        )
      );

      setMessage({
        tone: hasPropagationFailures(result) ? "warning" : "success",
        text: getPropagationSummary(result, locale) ?? localizedText(locale, "Dokumentet laddades upp.", "The document was uploaded."),
      });
    } catch (error) {
      stopProgress();
      if (uploadCleanupsRef.current.get(documentId) === cleanupUpload) {
        uploadCleanupsRef.current.delete(documentId);
      }

      if (controller.signal.aborted) return;

      const errorMessage = getUploadErrorMessage(error, locale);

      setDocuments((current) =>
        current.map((item) =>
          item.id === documentId
            ? {
                ...item,
                failed: true,
                errorMessage,
              }
            : item
        )
      );

      setMessage({
        tone: "error",
        text: errorMessage,
      });
    }
  };

  const handleDropFiles = (files: FileList) => {
    setMessage(null);

    const newDocuments = Array.from(files).map((file) => {
      const document = createDocumentFromFile(file);

      if (document.objectUrl) {
        objectUrlsRef.current.add(document.objectUrl);
      }

      return document;
    });

    setDocuments((current) => [...newDocuments, ...current]);

    newDocuments.forEach((document) => {
      if (document.file) {
        void uploadDocumentToBackend(document.id, document.file);
      }
    });
  };

  const handleRejectedFiles = () => {
    setMessage(localizedText(locale, "Filtypen stöds inte. Ladda upp PDF, Word eller bild.", "This file type is not supported. Upload a PDF, Word document or image."));
  };

  const handleOversizedFiles = () => {
    setMessage(localizedText(locale, "Filen får vara max 20 MB.", "The file can be up to 20 MB."));
  };

  const handleDeleteDocument = async (documentId: string) => {
    const document = documents.find((item) => item.id === documentId);
    if (!document) return;

    const shouldDelete = window.confirm(localizedText(locale, `Ta bort "${document.title}"?`, `Remove "${document.title}"?`));
    if (!shouldDelete) return;

    const uploadCleanup = uploadCleanupsRef.current.get(documentId);
    uploadCleanup?.();
    uploadCleanupsRef.current.delete(documentId);

    const shouldDeleteFromBackend = document.progress >= 100 && !document.failed;

    if (shouldDeleteFromBackend) {
      setDeletingDocumentId(documentId);

      try {
        await deleteDocument.mutateAsync(document.name);
      } catch (error) {
        setDeletingDocumentId(null);
        setMessage({
          tone: "error",
          text:
            error instanceof Error
              ? error.message
              : localizedText(locale, "Kunde inte radera dokumentet.", "Could not delete the document."),
        });
        return;
      }

      setDeletingDocumentId(null);
    }

    revokeObjectUrl(document.objectUrl);
    revokeObjectUrl(document.downloadUrl);

    setDocuments((current) => current.filter((item) => item.id !== documentId));
    setMessage(null);

    if (editingId === documentId) {
      setEditingId(null);
      setEditDraft(emptyEditDraft);
    }

    if (previewDocumentId === documentId) {
      setPreviewDocumentId(null);
    }
  };

  const handleRetryDocument = (documentId: string) => {
    const document = documents.find((item) => item.id === documentId);

    if (!document) return;
    if (!document.file) {
      setMessage({
        tone: "error",
        text: localizedText(locale, "Dokumentet saknar en lokal fil att ladda upp igen.", "The document does not have a local file to upload again."),
      });
      return;
    }

    setMessage(null);
    void uploadDocumentToBackend(documentId, document.file);
  };

  const handleDownloadDocument = async (documentId: string) => {
    const document = documents.find((item) => item.id === documentId);
    if (!document || document.failed || document.progress < 100) return;

    setDownloadingDocumentId(documentId);
    setMessage(null);

    try {
      const downloadUrl = await getBackendDocumentUrl(document.name);
      triggerBrowserDownload(downloadUrl, document.name);
      window.setTimeout(() => revokeObjectUrl(downloadUrl), 30000);
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : localizedText(locale, "Kunde inte ladda ner dokumentet.", "Could not download the document."),
      });
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const handlePreviewDocument = async (documentId: string) => {
    const document = documents.find((item) => item.id === documentId);
    if (!document || document.failed || document.progress < 100) return;

    const documentHref = getDocumentHref(document);

    if (documentHref) {
      setPreviewDocumentId(documentId);
      return;
    }

    setPreviewLoadingDocumentId(documentId);
    setMessage(null);

    try {
      const downloadUrl = await getBackendDocumentUrl(document.name);
      cacheDocumentDownloadUrl(documentId, downloadUrl);
      setPreviewDocumentId(documentId);
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : localizedText(locale, "Kunde inte hämta dokumentet för förhandsvisning.", "Could not load the document for preview."),
      });
    } finally {
      setPreviewLoadingDocumentId(null);
    }
  };

  const handleStartEdit = (document: StudentDocument) => {
    setEditingId(document.id);
    setEditDraft({
      title: document.title,
      note: document.note ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDraft(emptyEditDraft);
  };

  const handleSaveEdit = (documentId: string) => {
    const title = editDraft.title.trim();

    if (!title) {
      setMessage(localizedText(locale, "Ange ett namn för dokumentet.", "Enter a name for the document."));
      return;
    }

    setDocuments((current) =>
      current.map((item) =>
        item.id === documentId
          ? {
              ...item,
              title,
              note: editDraft.note.trim() || undefined,
            }
          : item
      )
    );

    setMessage(null);
    handleCancelEdit();
  };

  const renderActionButton = (
    props: BaseButtonProps & { destructive?: boolean }
  ) => {
    const { destructive, className, ...buttonProps } = props;

    return (
      <Button
        color={destructive ? "secondary-destructive" : "secondary"}
        size="sm"
        className={cx(
          destructive ? destructiveButtonClassName : buttonClassName,
          className
        )}
        {...buttonProps}
      />
    );
  };

  const renderPreviewContent = (document: StudentDocument) => {
    const documentHref = getDocumentHref(document);

    if (!documentHref) {
      return (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg bg-gray-50 px-6 text-center">
          <File05 className="h-10 w-10 text-gray-400" />
          <p className="mt-3 text-sm font-semibold text-gray-900">
            {localizedText(locale, "Dokumentet kan inte visas just nu.", "The document cannot be shown right now.")}
          </p>
          <p className="mt-1 max-w-md text-sm text-gray-500">
            {localizedText(locale, "Ingen filadress finns tillgänglig för förhandsvisning.", "No file URL is available for preview.")}
          </p>
        </div>
      );
    }

    if (isPdfDocument(document)) {
      return (
        <iframe
          src={documentHref}
          title={localizedText(locale, `Förhandsvisning av ${document.title}`, `Preview of ${document.title}`)}
          className="h-[70vh] min-h-[420px] w-full rounded-lg border border-gray-200 bg-white"
        />
      );
    }

    if (isImageDocument(document)) {
      return (
        <div className="flex max-h-[70vh] min-h-[360px] items-center justify-center overflow-auto rounded-lg bg-gray-50 p-4">
          <img
            src={documentHref}
            alt={document.title}
            className="max-h-[66vh] w-auto max-w-full rounded-md object-contain"
          />
        </div>
      );
    }

    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg bg-gray-50 px-6 text-center">
        <File05 className="h-10 w-10 text-gray-400" />
        <p className="mt-3 text-sm font-semibold text-gray-900">
          {localizedText(locale, "Förhandsvisning stöds inte för den här filtypen.", "Preview is not supported for this file type.")}
        </p>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          {localizedText(locale, "Ladda ner dokumentet för att öppna det i rätt program.", "Download the document to open it in the right program.")}
        </p>
      </div>
    );
  };

  const messageTone = typeof message === "string" ? "error" : message?.tone;
  const messageText = typeof message === "string" ? message : message?.text;

  return (
    <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6">
      <div className="border-t border-gray-200 pt-10">
        <div className="max-w-2xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#004225]">
              {localizedText(locale, "Profilbilagor", "Profile attachments")}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {localizedText(locale, "Mina dokument", "My documents")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              {localizedText(
                locale,
                "Samla intyg, studiebevis och andra filer som kan behövas i en bostadsansökan. PDF fungerar bäst.",
                "Collect certificates, proof of studies and other files that may be needed for a housing application. PDF works best.",
              )}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <FileUpload.Root className="gap-3">
            <FileUpload.DropZone
              accept={ACCEPTED_FILE_TYPES}
              maxSize={MAX_FILE_SIZE}
              buttonLabel={localizedText(locale, "Klicka för att ladda upp", "Click to upload")}
              mobileButtonSuffix={localizedText(locale, "och bifoga filer", "and attach files")}
              dragAndDropLabel={localizedText(locale, "eller dra och släpp", "or drag and drop")}
              hint={localizedText(locale, "PDF, DOC, DOCX, PNG eller JPG. Max 20 MB.", "PDF, DOC, DOCX, PNG or JPG. Max 20 MB.")}
              onDropFiles={handleDropFiles}
              onDropUnacceptedFiles={handleRejectedFiles}
              onSizeLimitExceed={handleOversizedFiles}
              className={dropZoneClassName}
            />

            {messageText && (
              <p
                className={cx(
                  "rounded-lg border px-3 py-2 text-sm font-medium",
                  messageTone === "success" &&
                    "border-emerald-100 bg-emerald-50/70 text-emerald-700",
                  messageTone === "warning" &&
                    "border-amber-100 bg-amber-50/70 text-amber-800",
                  messageTone === "error" &&
                    "border-red-100 bg-red-50/70 text-red-700"
                )}
              >
                {messageText}
              </p>
            )}

            {isLoadingDocuments ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {localizedText(locale, "Hämtar uppladdade dokument...", "Loading uploaded documents...")}
                </p>
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {localizedText(locale, "Inga dokument uppladdade än.", "No documents uploaded yet.")}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {localizedText(locale, "Lägg till ett dokument för att se det här.", "Add a document to see it here.")}
                </p>
              </div>
            ) : (
              <FileUpload.List>
                {documents.map((document) => {
                  const isEditing = editingId === document.id;
                  const canUseBackendDocument =
                    document.progress >= 100 &&
                    !document.failed &&
                    deletingDocumentId !== document.id;
                  const isDownloading = downloadingDocumentId === document.id;
                  const isPreviewLoading =
                    previewLoadingDocumentId === document.id;

                  return (
                    <Fragment key={document.id}>
                      <FileUpload.ListItemProgressBar
                        name={document.title || document.name}
                        size={document.size}
                        progress={document.progress}
                        failed={document.failed}
                        type={getFileListItemType(document)}
                        className={uploadListItemClassName}
                        onDelete={() => void handleDeleteDocument(document.id)}
                        onRetry={() => handleRetryDocument(document.id)}
                      />

                      <li className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                        {isEditing ? (
                          <div className="grid gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`document-title-${document.id}`}
                                >
                                  {localizedText(locale, "Namn", "Name")}
                                </Label>
                                <Input
                                  id={`document-title-${document.id}`}
                                  value={editDraft.title}
                                  onChange={(event) =>
                                    setEditDraft((current) => ({
                                      ...current,
                                      title: event.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>{localizedText(locale, "Originalfil", "Original file")}</Label>
                                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                  {document.name}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`document-note-${document.id}`}>
                                {localizedText(locale, "Anteckning", "Note")}
                              </Label>
                              <Textarea
                                id={`document-note-${document.id}`}
                                value={editDraft.note}
                                onChange={(event) =>
                                  setEditDraft((current) => ({
                                    ...current,
                                    note: event.target.value,
                                  }))
                                }
                                className="min-h-20"
                              />
                            </div>

                            <div className="flex flex-wrap justify-end gap-2">
                              {renderActionButton({
                                type: "button",
                                onClick: handleCancelEdit,
                                iconLeading: XClose,
                                children: localizedText(locale, "Avbryt", "Cancel"),
                              })}
                              {renderActionButton({
                                type: "button",
                                onClick: () => handleSaveEdit(document.id),
                                children: localizedText(locale, "Spara ändringar", "Save changes"),
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 text-sm text-gray-600">
                              <p>
                                {document.uploadedAt
                                  ? localizedText(
                                      locale,
                                      `Uppladdad ${formatUploadedAt(document.uploadedAt, locale)}`,
                                      `Uploaded ${formatUploadedAt(document.uploadedAt, locale)}`,
                                    )
                                  : localizedText(locale, "Uppladdad sedan tidigare", "Uploaded previously")}
                              </p>
                              {document.note && (
                                <RichTextParagraph
                                  text={document.note}
                                  className="mt-1 leading-6"
                                />
                              )}
                              {document.errorMessage && (
                                <p className="mt-1 text-red-600">
                                  {document.errorMessage}
                                </p>
                              )}
                              {document.propagationResult && (
                                <p
                                  className={cx(
                                    "mt-1",
                                    hasPropagationFailures(
                                      document.propagationResult
                                    )
                                      ? "text-amber-700"
                                      : "text-emerald-700"
                                  )}
                                >
                                  {getPropagationSummary(
                                    document.propagationResult,
                                    locale
                                  )}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                              {renderActionButton({
                                type: "button",
                                onClick: () =>
                                  void handlePreviewDocument(document.id),
                                iconLeading: Eye,
                                children: isPreviewLoading
                                  ? localizedText(locale, "Hämtar...", "Loading...")
                                  : localizedText(locale, "Förhandsvisa", "Preview"),
                                isDisabled:
                                  !canUseBackendDocument || isPreviewLoading,
                                className:
                                  !canUseBackendDocument || isPreviewLoading
                                  ? "pointer-events-none opacity-50"
                                  : undefined,
                              })}
                              {renderActionButton({
                                type: "button",
                                onClick: () =>
                                  void handleDownloadDocument(document.id),
                                iconLeading: Download01,
                                children: isDownloading
                                  ? localizedText(locale, "Hämtar...", "Loading...")
                                  : localizedText(locale, "Ladda ner", "Download"),
                                isDisabled:
                                  !canUseBackendDocument || isDownloading,
                                className:
                                  !canUseBackendDocument || isDownloading
                                    ? "pointer-events-none opacity-50"
                                    : undefined,
                              })}
                              {renderActionButton({
                                type: "button",
                                onClick: () => handleStartEdit(document),
                                iconLeading: Edit03,
                                children: localizedText(locale, "Redigera", "Edit"),
                                isDisabled: deletingDocumentId === document.id,
                                className:
                                  deletingDocumentId === document.id
                                    ? "pointer-events-none opacity-50"
                                    : undefined,
                              })}
                              {deletingDocumentId === document.id && (
                                <span className="self-center text-sm text-gray-500">
                                  {localizedText(locale, "Raderar...", "Deleting...")}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    </Fragment>
                  );
                })}
              </FileUpload.List>
            )}
          </FileUpload.Root>
        </div>
      </div>

      {previewDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-preview-title"
          onMouseDown={() => setPreviewDocumentId(null)}
        >
          <div
            className="flex max-h-full w-full max-w-5xl flex-col rounded-lg bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h3
                  id="document-preview-title"
                  className="truncate text-base font-semibold text-gray-900"
                >
                  {previewDocument.title}
                </h3>
                <p className="mt-1 truncate text-sm text-gray-500">
                  {previewDocument.name}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {renderActionButton({
                  type: "button",
                  onClick: () => void handleDownloadDocument(previewDocument.id),
                  iconLeading: Download01,
                  children:
                    downloadingDocumentId === previewDocument.id
                      ? localizedText(locale, "Hämtar...", "Loading...")
                      : localizedText(locale, "Ladda ner", "Download"),
                  isDisabled: downloadingDocumentId === previewDocument.id,
                  className:
                    downloadingDocumentId === previewDocument.id
                      ? "pointer-events-none opacity-50"
                      : undefined,
                })}
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => setPreviewDocumentId(null)}
                  aria-label={localizedText(locale, "Stäng förhandsvisning", "Close preview")}
                >
                  <XClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-auto p-4 sm:p-5">
              {renderPreviewContent(previewDocument)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

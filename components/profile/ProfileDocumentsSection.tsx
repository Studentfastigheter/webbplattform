"use client";

import {
  Fragment,
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from "react";
import { Download01, Edit03, Eye, File05, XClose } from "@untitledui/icons";

import {
  FileUpload,
  type FileListItemProps,
} from "@/components/application/file-upload/file-upload-base";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cx } from "@/lib/utils/cx";
import {
  documentService,
  type DocumentPropagationResult,
} from "@/services/document-service";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf";

type FileIconType = FileListItemProps["type"];
type BaseButtonProps = ComponentProps<typeof Button>;

type StudentDocument = {
  id: string;
  title: string;
  note?: string;
  name: string;
  file: File;
  size: number;
  type?: FileIconType;
  mimeType?: string;
  progress: number;
  failed?: boolean;
  errorMessage?: string;
  propagationResult?: DocumentPropagationResult;
  uploadedAt: string;
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

function formatUploadedAt(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

function getPropagationSummary(result?: DocumentPropagationResult) {
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
      return `${successes} bolag tog emot dokumentet, ${failures} misslyckades.`;
    }

    if (successes > 0) {
      return `Dokumentet skickades till ${successes} bolag.`;
    }

    return "Dokumentet laddades upp, men inga mottagare rapporterades.";
  }

  return result.message ?? "Dokumentet laddades upp till backend.";
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

function getUploadErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Kunde inte ladda upp dokumentet till backend.";
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

export default function ProfileDocumentsSection() {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyEditDraft);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(
    null
  );

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
      const result = await documentService.upload(file, {
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
        text: getPropagationSummary(result) ?? "Dokumentet laddades upp.",
      });
    } catch (error) {
      stopProgress();
      if (uploadCleanupsRef.current.get(documentId) === cleanupUpload) {
        uploadCleanupsRef.current.delete(documentId);
      }

      if (controller.signal.aborted) return;

      const errorMessage = getUploadErrorMessage(error);

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
      void uploadDocumentToBackend(document.id, document.file);
    });
  };

  const handleRejectedFiles = () => {
    setMessage("Filtypen stöds inte. Ladda upp PDF, Word eller bild.");
  };

  const handleOversizedFiles = () => {
    setMessage("Filen får vara max 20 MB.");
  };

  const handleDeleteDocument = (documentId: string) => {
    const document = documents.find((item) => item.id === documentId);
    if (!document) return;

    const shouldDelete = window.confirm(`Ta bort "${document.title}"?`);
    if (!shouldDelete) return;

    uploadCleanupsRef.current.get(documentId)?.();
    uploadCleanupsRef.current.delete(documentId);
    revokeObjectUrl(document.objectUrl);

    setDocuments((current) => current.filter((item) => item.id !== documentId));

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

    setMessage(null);
    void uploadDocumentToBackend(documentId, document.file);
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
      setMessage("Ange ett namn för dokumentet.");
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
            Dokumentet kan inte visas just nu.
          </p>
          <p className="mt-1 max-w-md text-sm text-gray-500">
            Ingen filadress finns tillgänglig för förhandsvisning.
          </p>
        </div>
      );
    }

    if (isPdfDocument(document)) {
      return (
        <iframe
          src={documentHref}
          title={`Förhandsvisning av ${document.title}`}
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
          Förhandsvisning stöds inte för den här filtypen.
        </p>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          Ladda ner dokumentet för att öppna det i rätt program.
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
              Profilbilagor
            </p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Mina dokument
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Samla intyg, studiebevis och andra filer som kan behövas i en
              bostadsansökan. PDF fungerar bäst.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <FileUpload.Root className="gap-3">
            <FileUpload.DropZone
              accept={ACCEPTED_FILE_TYPES}
              maxSize={MAX_FILE_SIZE}
              buttonLabel="Klicka för att ladda upp"
              mobileButtonSuffix="och bifoga filer"
              dragAndDropLabel="eller dra och släpp"
              hint="PDF, DOC, DOCX, PNG eller JPG. Max 20 MB."
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

            {documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center">
                <p className="text-sm font-medium text-gray-900">
                  Inga dokument uppladdade än.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Lägg till ett dokument för att se det här.
                </p>
              </div>
            ) : (
              <FileUpload.List>
                {documents.map((document) => {
                  const isEditing = editingId === document.id;
                  const documentHref = getDocumentHref(document);

                  return (
                    <Fragment key={document.id}>
                      <FileUpload.ListItemProgressBar
                        name={document.title || document.name}
                        size={document.size}
                        progress={document.progress}
                        failed={document.failed}
                        type={getFileListItemType(document)}
                        className={uploadListItemClassName}
                        onDelete={() => handleDeleteDocument(document.id)}
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
                                  Namn
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
                                <Label>Originalfil</Label>
                                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                  {document.name}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`document-note-${document.id}`}>
                                Anteckning
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
                                children: "Avbryt",
                              })}
                              {renderActionButton({
                                type: "button",
                                onClick: () => handleSaveEdit(document.id),
                                children: "Spara ändringar",
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 text-sm text-gray-600">
                              <p>
                                Uppladdad {formatUploadedAt(document.uploadedAt)}
                              </p>
                              {document.note && (
                                <p className="mt-1 leading-6">
                                  {document.note}
                                </p>
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
                                    document.propagationResult
                                  )}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                              {renderActionButton({
                                type: "button",
                                onClick: () => setPreviewDocumentId(document.id),
                                iconLeading: Eye,
                                children: "Förhandsvisa",
                                isDisabled: !documentHref,
                                className: !documentHref
                                  ? "pointer-events-none opacity-50"
                                  : undefined,
                              })}
                              <Button
                                href={documentHref}
                                download={document.name}
                                color="secondary"
                                size="sm"
                                iconLeading={Download01}
                                className={cx(
                                  buttonClassName,
                                  !documentHref &&
                                    "pointer-events-none opacity-50"
                                )}
                              >
                                Ladda ner
                              </Button>
                              {renderActionButton({
                                type: "button",
                                onClick: () => handleStartEdit(document),
                                iconLeading: Edit03,
                                children: "Redigera",
                              })}
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
                <Button
                  href={getDocumentHref(previewDocument)}
                  download={previewDocument.name}
                  isDisabled={!getDocumentHref(previewDocument)}
                  color="secondary"
                  size="sm"
                  iconLeading={Download01}
                  className={buttonClassName}
                >
                  Ladda ner
                </Button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => setPreviewDocumentId(null)}
                  aria-label="Stäng förhandsvisning"
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

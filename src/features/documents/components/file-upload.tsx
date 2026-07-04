"use client";

import type { ComponentPropsWithRef } from "react";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, Trash01, UploadCloud02, XCircle } from "@/components/icons";
import { cx } from "@/lib/utils/cx";

/**
 * Feature-ägd ersättare för den tidigare UntitledUI-baserade file-upload-kedjan
 * (components/{application,base,foundations}). Samma publika API som förr
 * (FileUpload.Root/DropZone/List/ListItemProgressBar) men styld med riktiga
 * Tailwind-utilities — UntitledUI-tokenklasserna kompilerade aldrig.
 */

export const getReadableFileSize = (bytes: number) => {
  if (bytes === 0) return "0 KB";

  const suffixes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return Math.floor(bytes / Math.pow(1024, i)) + " " + suffixes[i];
};

export type FileIconType = "pdf" | "doc" | "docx" | "jpg" | "jpeg" | "png" | "empty";

const fileIconStyles: Record<FileIconType, { label: string; className: string }> = {
  pdf: { label: "PDF", className: "bg-red-50 text-red-700 ring-red-200" },
  doc: { label: "DOC", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  docx: { label: "DOC", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  jpg: { label: "JPG", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  jpeg: { label: "JPG", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  png: { label: "PNG", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  empty: { label: "FIL", className: "bg-gray-50 text-gray-600 ring-gray-200" },
};

function FileTypeBadge({ type }: { type?: FileIconType }) {
  const style = fileIconStyles[type ?? "empty"] ?? fileIconStyles.empty;

  return (
    <span
      aria-hidden="true"
      className={cx(
        "flex size-10 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tracking-wide ring-1 ring-inset",
        style.className
      )}
    >
      {style.label}
    </span>
  );
}

type FileUploadDropZoneProps = {
  className?: string;
  /** Hjälptext om vilka filtyper som accepteras. */
  hint?: string;
  buttonLabel?: string;
  /** Extra knapptext som visas på mobil. */
  mobileButtonSuffix?: string;
  /** Dra-och-släpp-texten som visas på större skärmar. */
  dragAndDropLabel?: string;
  isDisabled?: boolean;
  /** Samma format som <input accept>: ".pdf,image/*,application/pdf" */
  accept?: string;
  allowsMultiple?: boolean;
  /** Maximal filstorlek i bytes. */
  maxSize?: number;
  onDropFiles?: (files: FileList) => void;
  onDropUnacceptedFiles?: (files: FileList) => void;
  onSizeLimitExceed?: (files: FileList) => void;
};

const FileUploadDropZone = ({
  className,
  hint,
  buttonLabel = "Klicka för att ladda upp",
  mobileButtonSuffix = "och bifoga filer",
  dragAndDropLabel = "eller dra och släpp",
  isDisabled,
  accept,
  allowsMultiple = true,
  maxSize,
  onDropFiles,
  onDropUnacceptedFiles,
  onSizeLimitExceed,
}: FileUploadDropZoneProps) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const isFileTypeAccepted = (file: File): boolean => {
    if (!accept) return true;

    const acceptedTypes = accept.split(",").map((type) => type.trim());

    return acceptedTypes.some((acceptedType) => {
      // Filändelser (t.ex. .pdf, .doc)
      if (acceptedType.startsWith(".")) {
        const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        return extension === acceptedType.toLowerCase();
      }

      // Wildcards (t.ex. image/*)
      if (acceptedType.endsWith("/*")) {
        const typePrefix = acceptedType.split("/")[0];
        return file.type.startsWith(`${typePrefix}/`);
      }

      // Exakta MIME-typer (t.ex. application/pdf)
      return file.type === acceptedType;
    });
  };

  const handleDragIn = (event: React.DragEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragOut = (event: React.DragEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const processFiles = (files: File[]): void => {
    setIsInvalid(false);

    const acceptedFiles: File[] = [];
    const unacceptedFiles: File[] = [];
    const oversizedFiles: File[] = [];

    const filesToProcess = allowsMultiple ? files : files.slice(0, 1);

    filesToProcess.forEach((file) => {
      if (maxSize && file.size > maxSize) {
        oversizedFiles.push(file);
        return;
      }

      if (isFileTypeAccepted(file)) {
        acceptedFiles.push(file);
      } else {
        unacceptedFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0 && typeof onSizeLimitExceed === "function") {
      const dataTransfer = new DataTransfer();
      oversizedFiles.forEach((file) => dataTransfer.items.add(file));

      setIsInvalid(true);
      onSizeLimitExceed(dataTransfer.files);
    }

    if (acceptedFiles.length > 0 && typeof onDropFiles === "function") {
      const dataTransfer = new DataTransfer();
      acceptedFiles.forEach((file) => dataTransfer.items.add(file));
      onDropFiles(dataTransfer.files);
    }

    if (unacceptedFiles.length > 0 && typeof onDropUnacceptedFiles === "function") {
      const unacceptedDataTransfer = new DataTransfer();
      unacceptedFiles.forEach((file) => unacceptedDataTransfer.items.add(file));

      setIsInvalid(true);
      onDropUnacceptedFiles(unacceptedDataTransfer.files);
    }

    // Nollställ inputen så samma fil kan väljas igen.
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    handleDragOut(event);
    processFiles(Array.from(event.dataTransfer.files));
  };

  const handleInputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(event.target.files || []));
  };

  return (
    <div
      data-dropzone
      onDragOver={handleDragIn}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragEnd={handleDragOut}
      onDrop={handleDrop}
      className={cx(
        "relative flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 px-6 py-4 text-gray-500 transition-colors duration-100 ease-linear hover:border-[#004225]/50 hover:bg-white",
        isDraggingOver && "border-solid border-[#004225] bg-white",
        isDisabled && "cursor-not-allowed opacity-60 hover:border-gray-300 hover:bg-gray-50/70",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200">
        <UploadCloud02 className="size-5" aria-hidden="true" />
      </span>

      <div className="flex flex-col gap-1 text-center">
        <div className="flex justify-center gap-1 text-center">
          <input
            ref={inputRef}
            id={id}
            type="file"
            className="peer sr-only"
            disabled={isDisabled}
            accept={accept}
            multiple={allowsMultiple}
            onChange={handleInputFileChange}
          />
          <label
            htmlFor={id}
            className="flex cursor-pointer text-sm font-semibold text-[#004225] hover:underline peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#004225]"
          >
            {buttonLabel}
            <span className="ml-1 md:hidden">{mobileButtonSuffix}</span>
          </label>
          <span className="text-sm max-md:hidden">{dragAndDropLabel}</span>
        </div>
        <p
          className={cx(
            "text-xs transition-colors duration-100 ease-linear",
            isInvalid && "text-red-600"
          )}
        >
          {hint || "PDF, DOC, DOCX, PNG eller JPG."}
        </p>
      </div>
    </div>
  );
};

export interface FileListItemProps {
  name: string;
  /** Filstorlek i bytes. */
  size: number;
  /** Uppladdningsprogress 0–100. */
  progress: number;
  failed?: boolean;
  type?: FileIconType;
  className?: string;
  onDelete?: () => void;
  onRetry?: () => void;
  /** Lokaliserbara statustexter. */
  completeLabel?: string;
  uploadingLabel?: string;
  failedLabel?: string;
  retryLabel?: string;
  deleteLabel?: string;
}

const FileListItemProgressBar = ({
  name,
  size,
  progress,
  failed,
  type,
  onDelete,
  onRetry,
  className,
  completeLabel = "Klar",
  uploadingLabel = "Laddar upp...",
  failedLabel = "Misslyckades",
  retryLabel = "Försök igen",
  deleteLabel = "Ta bort",
}: FileListItemProps) => {
  const isComplete = progress === 100;

  return (
    <motion.li
      layout="position"
      className={cx(
        "relative flex gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-inset ring-gray-200 transition-shadow duration-100 ease-linear",
        failed && "ring-2 ring-red-300",
        className
      )}
    >
      <FileTypeBadge type={type} />

      <div className="flex min-w-0 flex-1 flex-col items-start">
        <div className="flex w-full max-w-full min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{name}</p>

            <div className="mt-0.5 flex items-center gap-2">
              <p className="truncate text-sm whitespace-nowrap text-gray-500">
                {getReadableFileSize(size)}
              </p>

              <hr className="h-3 w-px rounded-full border-none bg-gray-200" />

              <div className="flex items-center gap-1">
                {isComplete && (
                  <>
                    <CheckCircle className="size-4 stroke-[2.5px] text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700">{completeLabel}</p>
                  </>
                )}

                {!isComplete && !failed && (
                  <>
                    <UploadCloud02 className="size-4 stroke-[2.5px] text-gray-400" />
                    <p className="text-sm font-medium text-gray-500">{uploadingLabel}</p>
                  </>
                )}

                {failed && (
                  <>
                    <XCircle className="size-4 text-red-600" />
                    <p className="text-sm font-medium text-red-600">{failedLabel}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onDelete}
            aria-label={deleteLabel}
            title={deleteLabel}
            className="-mt-2 -mr-2 inline-flex size-8 shrink-0 items-center justify-center self-start rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]"
          >
            <Trash01 className="size-4" aria-hidden="true" />
          </button>
        </div>

        {!failed && (
          <div className="mt-1 flex w-full items-center gap-3">
            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"
            >
              <div
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                className="h-full rounded-full bg-[#004225] transition-[width] duration-150 ease-linear"
              />
            </div>
            <span className="text-sm font-medium tabular-nums text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
        )}

        {failed && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1.5 text-sm font-semibold text-red-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </motion.li>
  );
};

const FileUploadRoot = (props: ComponentPropsWithRef<"div">) => (
  <div {...props} className={cx("flex flex-col gap-4", props.className)}>
    {props.children}
  </div>
);

const FileUploadList = (props: ComponentPropsWithRef<"ul">) => (
  <ul {...props} className={cx("flex flex-col gap-3", props.className)}>
    <AnimatePresence initial={false}>{props.children}</AnimatePresence>
  </ul>
);

export const FileUpload = {
  Root: FileUploadRoot,
  List: FileUploadList,
  DropZone: FileUploadDropZone,
  ListItemProgressBar: FileListItemProgressBar,
};

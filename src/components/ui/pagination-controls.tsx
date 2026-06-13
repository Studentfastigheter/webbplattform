"use client";

import { ChevronLeft, ChevronRight } from "@/components/icons";

import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
  pageLabel?: (page: number) => string;
  isDisabled?: boolean;
  className?: string;
};

const pageButtonBase =
  "flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-medium leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] disabled:cursor-not-allowed";

const arrowButtonClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#004225] transition-colors hover:bg-[#004225]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] disabled:cursor-not-allowed disabled:text-[#004225]/25 disabled:hover:bg-transparent";

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel,
  previousLabel,
  nextLabel,
  pageLabel,
  isDisabled = false,
  className,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  if (safeTotalPages <= 1) {
    return null;
  }

  const paginationStart = Math.max(1, safeCurrentPage - 2);
  const paginationEnd = Math.min(safeTotalPages, safeCurrentPage + 2);
  const paginationPages = Array.from(
    { length: paginationEnd - paginationStart + 1 },
    (_, index) => paginationStart + index,
  );

  const goToPage = (page: number) => {
    if (isDisabled) return;
    onPageChange(Math.min(Math.max(1, page), safeTotalPages));
  };

  const renderPageButton = (pageNumber: number) => {
    const isActive = pageNumber === safeCurrentPage;

    return (
      <button
        key={pageNumber}
        type="button"
        onClick={() => goToPage(pageNumber)}
        disabled={isActive || isDisabled}
        aria-current={isActive ? "page" : undefined}
        aria-label={pageLabel?.(pageNumber)}
        className={`${pageButtonBase} ${
          isActive
            ? "bg-[#004225] text-white disabled:opacity-100"
            : "text-[#004225] hover:bg-[#004225]/5 disabled:opacity-40"
        }`}
      >
        {pageNumber}
      </button>
    );
  };

  return (
    <nav
      className={cn("flex items-center justify-center gap-3 sm:gap-4", className)}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage - 1)}
        disabled={safeCurrentPage <= 1 || isDisabled}
        aria-label={previousLabel}
        className={arrowButtonClass}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2">
        {paginationPages[0] > 1 && (
          <>
            {renderPageButton(1)}
            <span className="flex h-8 min-w-4 items-center justify-center text-sm font-medium text-[#004225]/45">
              ...
            </span>
          </>
        )}

        {paginationPages.map(renderPageButton)}

        {paginationPages[paginationPages.length - 1] < safeTotalPages && (
          <>
            <span className="flex h-8 min-w-4 items-center justify-center text-sm font-medium text-[#004225]/45">
              ...
            </span>
            {renderPageButton(safeTotalPages)}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage + 1)}
        disabled={safeCurrentPage >= safeTotalPages || isDisabled}
        aria-label={nextLabel}
        className={arrowButtonClass}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  );
}

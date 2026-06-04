"use client";

import { useRouter } from "next/navigation";
import { PaginationControls } from "@/components/ui/pagination-controls";
import ListingCardFromDTO from "@/features/listings/components/ListingCardFromDTO";
import { type ListingCardDTO } from "@/types/listing";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

type Props = {
  listings: ListingCardDTO[];
  title?: string;
  page?: number;
  totalPages?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
};

const ROWS = 2;
const COLS = 3;
const MAX_VISIBLE_LISTINGS = ROWS * COLS;

export default function QueueListings({
  listings,
  title,
  page = 1,
  totalPages = 1,
  isLoading = false,
  onPageChange,
}: Props) {
  const router = useRouter();
  const { locale, localizedHref, t } = useI18n();
  const visible = listings.slice(0, MAX_VISIBLE_LISTINGS);
  const safeTotalPages = Math.max(1, totalPages);
  const currentPage = Math.min(Math.max(1, page), safeTotalPages);

  const handlePageChange = (nextPage: number) => {
    if (!onPageChange || isLoading) return;
    onPageChange(Math.min(Math.max(1, nextPage), safeTotalPages));
  };

  return (
    <section>
      <div className="mb-5 flex items-center">
        <h2 className="text-[20px] font-semibold leading-7 text-gray-900 sm:text-[22px] sm:leading-8 lg:text-2xl">
          {title ?? t("queueListings.defaultTitle")}
        </h2>
      </div>

      <div className="grid grid-cols-1 justify-items-center gap-5 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
        {visible.map((listing) => (
          <div key={listing.id} className="flex w-full justify-center">
            <ListingCardFromDTO
              listing={listing}
              showFavoriteButton={false}
              onOpen={() => router.push(localizedHref(`/housing/${listing.id}`))}
            />
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex min-h-[52px] items-center justify-center py-4">
          <span className="animate-pulse text-sm text-gray-500">
            {t("queueListings.loading")}
          </span>
        </div>
      )}

      {onPageChange && safeTotalPages > 1 && (
        <PaginationControls
          className="mt-8"
          currentPage={currentPage}
          totalPages={safeTotalPages}
          onPageChange={handlePageChange}
          isDisabled={isLoading}
          ariaLabel={t("queueListings.paginationAria")}
          previousLabel={t("queueListings.previous")}
          nextLabel={t("queueListings.next")}
          pageLabel={(pageNumber) =>
            localizedText(locale, `Sida ${pageNumber}`, `Page ${pageNumber}`)
          }
        />
      )}
    </section>
  );
}

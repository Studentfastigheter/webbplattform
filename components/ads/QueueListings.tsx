"use client";

import { useRouter } from "next/navigation";
import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import { type ListingCardDTO } from "@/types/listing";

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

const splitListingLocation = (location?: string | null) => {
  const [area, ...cityParts] = (location ?? "").split(",");
  const trimmedArea = area?.trim();
  const trimmedCity = cityParts.join(",").trim();

  return {
    area: trimmedArea || "Ej angivet",
    city: trimmedCity || trimmedArea || "Ej angivet",
  };
};

export default function QueueListings({
  listings,
  title = "Våra bostäder",
  page = 1,
  totalPages = 1,
  isLoading = false,
  onPageChange,
}: Props) {
  const router = useRouter();
  const visible = listings.slice(0, MAX_VISIBLE_LISTINGS);
  const safeTotalPages = Math.max(1, totalPages);
  const currentPage = Math.min(Math.max(1, page), safeTotalPages);
  const paginationStart = Math.max(1, currentPage - 2);
  const paginationEnd = Math.min(safeTotalPages, currentPage + 2);
  const paginationPages =
    safeTotalPages <= 1
      ? []
      : Array.from(
          { length: paginationEnd - paginationStart + 1 },
          (_, index) => paginationStart + index,
        );

  const handlePageChange = (nextPage: number) => {
    if (!onPageChange || isLoading) return;
    onPageChange(Math.min(Math.max(1, nextPage), safeTotalPages));
  };

  return (
    <section>
      <div className="mb-5 flex items-center">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((listing) => {
          const { area, city } = splitListingLocation(listing.location);

          return (
            <div key={listing.id} className="flex w-full justify-center">
              <ListingCardSmall
                id={listing.id}
                title={listing.title}
                area={area}
                city={city}
                dwellingType={listing.dwellingType || "Bostad"}
                rooms={listing.rooms || 0}
                sizeM2={listing.sizeM2 || 0}
                rent={listing.rent || 0}
                landlordType={listing.hostType}
                hostName={listing.hostName}
                hostLogoUrl={listing.hostLogoUrl}
                isVerified={listing.verifiedHost}
                imageUrl={listing.imageUrl}
                tags={listing.tags}
                showFavoriteButton={false}
                onClick={() => router.push(`/bostader/${listing.id}`)}
              />
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex min-h-[52px] items-center justify-center py-4">
          <span className="animate-pulse text-sm text-gray-500">
            Hämtar bostäder...
          </span>
        </div>
      )}

      {onPageChange && safeTotalPages > 1 && (
        <nav
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          aria-label="Sidnavigering för företagets bostäder"
        >
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="h-10 rounded-full border border-black/15 px-4 text-sm font-semibold text-[#004225] transition hover:bg-[#004225]/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Föregående
          </button>

          <div className="flex items-center gap-2">
            {paginationPages[0] > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handlePageChange(1)}
                  disabled={isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-black transition hover:border-[#004225] hover:text-[#004225] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  1
                </button>
                <span className="px-1 text-sm text-black/45">...</span>
              </>
            )}

            {paginationPages.map((pageNumber) => {
              const isActive = pageNumber === currentPage;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={isActive || isLoading}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    isActive
                      ? "border-[#004225] bg-[#004225] text-white"
                      : "border-black/15 text-black hover:border-[#004225] hover:text-[#004225]"
                  } disabled:cursor-not-allowed`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {paginationPages[paginationPages.length - 1] < safeTotalPages && (
              <>
                <span className="px-1 text-sm text-black/45">...</span>
                <button
                  type="button"
                  onClick={() => handlePageChange(safeTotalPages)}
                  disabled={isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-black transition hover:border-[#004225] hover:text-[#004225] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {safeTotalPages}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= safeTotalPages || isLoading}
            className="h-10 rounded-full border border-black/15 px-4 text-sm font-semibold text-[#004225] transition hover:bg-[#004225]/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Nästa
          </button>
        </nav>
      )}
    </section>
  );
}

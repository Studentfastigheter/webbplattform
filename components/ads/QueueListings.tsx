import Link from "next/link";
import ListingCard_Small, {
  type ListingCardSmallProps,
} from "@/components/Listings/ListingCard_Small";

type Props = {
  listings: ListingCardSmallProps[];
  title?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function QueueListings({
  listings,
  title = "Våra bostäder",
  ctaHref = "/bostader",
  ctaLabel = "Visa alla bostäder",
}: Props) {
  const visibleListings = listings.slice(0, 8);

  return (
    <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {ctaHref && (
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-green-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            {ctaLabel}
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleListings.map((listing, index) => (
          <ListingCard_Small
            key={`${listing.title}-${index}`}
            {...listing}
          />
        ))}
      </div>
    </section>
  );
}

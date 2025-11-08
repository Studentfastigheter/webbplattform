import Link from "next/link";
import type { Listing } from "../MapFunctionality/MapView";
import { SkeletonImage } from "@/components/ui/skeleton-image";

export default function ListingCard({
  l,
  onHover,
  onLeave,
}: {
  l: Listing;
  onHover?: (id: number) => void;
  onLeave?: () => void;
}) {
  return (
    <Link href={`/listings/${l.id}`} className="block">
      <article
        className="card transition shadow-soft"
        onMouseEnter={() => onHover?.(l.id)}
        onMouseLeave={() => onLeave?.()}
      >
        <div className="relative w-full h-48 rounded-md overflow-hidden mb-3 bg-gray-100">
          <SkeletonImage
            src={(l.images?.[0] ?? l.imageUrl) || "/placeholder.svg"}
            alt={l.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <span className="badge badge-brand">
              {typeof l.price === "number" ? `${l.price} kr/mån` : "Pris ej angivet"}
            </span>
            {typeof (l as any).distanceToSchoolKm === 'number' && (
              <span className="badge">{(l as any).distanceToSchoolKm.toFixed(1)} km</span>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold line-clamp-1">{l.title}</div>
            <div className="text-muted text-sm">{l.city || "—"}</div>
          </div>
          <div className="hidden sm:block text-sm pill">Visa ➜</div>
        </div>
      </article>
    </Link>
  );
}


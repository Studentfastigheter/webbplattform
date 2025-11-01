import Image from "next/image";
import type { Listing } from "../MapFunctionality/MapView";

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
    <article
      className="card hover:shadow-sm transition"
      onMouseEnter={() => onHover?.(l.id)}
      onMouseLeave={() => onLeave?.()}
    >
      <div className="relative w-full h-40 rounded-md overflow-hidden mb-3 bg-gray-100">
        <Image
          src={l.imageUrl || "/placeholder.jpg"}
          alt={l.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{l.title}</div>
          <div className="text-muted text-sm">{l.city || "—"}</div>
        </div>
        <div className="font-semibold">
          {typeof l.price === "number" ? `${l.price} kr/mån` : "—"}
        </div>
      </div>
    </article>
  );
}
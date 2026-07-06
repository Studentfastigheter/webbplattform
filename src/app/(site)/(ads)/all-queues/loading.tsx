import ListPageSkeleton from "../_components/ListPageSkeleton";

import QueueCardSkeleton from "@/features/listings/components/QueueCardSkeleton";

/**
 * Visas direkt vid navigering till /all-queues medan servern prefetchar
 * bostadsbolagen — samma grid som AllQueuesPageClient renderar under laddning.
 */
export default function Loading() {
  return (
    <ListPageSkeleton>
      <div className="grid w-full grid-cols-1 justify-start gap-3 sm:gap-5 md:grid-cols-2 lg:gap-6 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <QueueCardSkeleton key={`queue-skeleton-${index}`} />
        ))}
      </div>
    </ListPageSkeleton>
  );
}

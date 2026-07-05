import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const pulse = "motion-reduce:animate-none";

/** Skugga av Que_ListingCard under laddning — samma yttre form och innehållsrytm. */
export default function QueueCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full min-h-[244px] w-full flex-col rounded-[26px] border border-black/[0.05] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:min-h-[254px] sm:rounded-[28px] sm:p-5",
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Skeleton className={cn("h-16 w-16 rounded-2xl sm:h-[82px] sm:w-[82px]", pulse)} />
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1.5 sm:pt-2.5">
          <Skeleton className={cn("h-5 w-3/4", pulse)} />
          <Skeleton className={cn("h-3.5 w-32", pulse)} />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:mt-5">
        <Skeleton className={cn("h-3.5 w-full", pulse)} />
        <Skeleton className={cn("h-3.5 w-5/6", pulse)} />
        <Skeleton className={cn("h-3.5 w-2/3", pulse)} />
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2.5 pt-5 sm:gap-3 sm:pt-6">
        <Skeleton className={cn("h-10 rounded-full sm:h-11", pulse)} />
        <Skeleton className={cn("h-10 rounded-full sm:h-11", pulse)} />
      </div>
    </div>
  );
}

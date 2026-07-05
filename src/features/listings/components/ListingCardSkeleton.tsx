import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ListingCardSkeletonProps = {
  variant?: "default" | "compact";
  className?: string;
};

const pulse = "motion-reduce:animate-none";

/**
 * Skugga av ListingCard_Small under laddning — samma yttre form
 * (radie, skugga, 16:10-bildyta) så innehållet inte hoppar när korten kommer.
 */
export default function ListingCardSkeleton({
  variant = "default",
  className,
}: ListingCardSkeletonProps) {
  const isCompact = variant === "compact";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)]",
        isCompact ? "max-w-[360px]" : "max-w-[470px]",
        className
      )}
    >
      <Skeleton className={cn("aspect-[16/10] w-full rounded-none", pulse)} />
      <div className={cn("flex flex-col", isCompact ? "gap-1.5 p-3" : "gap-2 p-3.5")}>
        <Skeleton className={cn("h-3 w-24", pulse)} />
        <Skeleton className={cn("h-4 w-3/4", pulse)} />
        <Skeleton className={cn("h-4 w-20", pulse)} />
        <Skeleton className={cn("h-3 w-40 max-w-full", pulse)} />
        <div className="flex gap-1.5 pt-0.5">
          <Skeleton className={cn("h-5 w-14 rounded-full", pulse)} />
          <Skeleton className={cn("h-5 w-16 rounded-full", pulse)} />
          <Skeleton className={cn("h-5 w-12 rounded-full", pulse)} />
        </div>
      </div>
    </div>
  );
}

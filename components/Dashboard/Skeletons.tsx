import { SkeletonWrapperProps } from "@/lib/definitions";
import { Skeleton } from "../ui/skeleton";
import Container from "@/app/(business_portal)/_components/Container";

export function SkeletonWrapper({gap, count, children}: SkeletonWrapperProps) {
    const gapClasses = {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    };
    return (
        <div className={`flex flex-wrap ${gapClasses[gap]}`}>
            {Array.from({ length: count }).map((_, index) => (
                <FloorplanSkeleton key={index} />
            ))}
        </div>
    );
}

export function FloorplanSkeleton() {
    return (
        <div className="w-24 h-24 aspect-square bg-gray-300 rounded animate-pulse"></div>
    );
}


type StatisticSkeletonCardProps = {
    className?: string;
}

function StatisticSkeletonCard({
  className,
}: StatisticSkeletonCardProps) {
  return (
    <Container padding="sm" className={className}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="mt-3">
        <Skeleton className="h-6 w-20" />
      </div>
    </Container>
  )
}

type StatisticsSkeletonProps = {
    count?: number;
    className?: string;
}

export default function StatisticsSkeleton({
    count=4,
    className,
}: StatisticsSkeletonProps) {
  return (
    <div className="grid grid-cols-12 md:grid-cols-8">
      {Array.from({ length: count }).map((_, i) => (
        <StatisticSkeletonCard key={i} className={className} />
      ))}
    </div>
  )
}
import { SkeletonWrapperProps } from "@/lib/definitions";

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
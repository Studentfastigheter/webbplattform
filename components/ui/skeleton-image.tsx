import NextImage, { ImageProps as NextImageProps } from "next/image";
import { ImgHTMLAttributes, useState } from "react";
import { Skeleton } from "@heroui/skeleton";
import { cn } from "@/lib/utils";

export type SkeletonImageProps = NextImageProps & {
  skeletonClassName?: string;
  contentClassName?: string;
};

export const SkeletonImage = ({
  className,
  skeletonClassName,
  contentClassName,
  onLoadingComplete,
  ...props
}: SkeletonImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Skeleton
      isLoaded={loaded}
      classNames={{
        base: cn("block h-full w-full overflow-hidden bg-muted/40", skeletonClassName),
        content: cn("relative block h-full w-full", contentClassName),
      }}
    >
      <NextImage
        {...props}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoadingComplete={(result) => {
          setLoaded(true);
          onLoadingComplete?.(result);
        }}
      />
    </Skeleton>
  );
};

export type SkeletonImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  skeletonClassName?: string;
  contentClassName?: string;
};

export const SkeletonImg = ({
  className,
  skeletonClassName,
  contentClassName,
  onLoad,
  ...props
}: SkeletonImgProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Skeleton
      isLoaded={loaded}
      classNames={{
        base: cn(
          "relative inline-flex overflow-hidden bg-muted/40",
          skeletonClassName,
        ),
        content: cn("relative inline-flex", contentClassName),
      }}
    >
      <img
        {...props}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
      />
    </Skeleton>
  );
};

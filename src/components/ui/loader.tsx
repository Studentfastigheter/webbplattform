import type * as React from "react"

import { cn } from "@/lib/utils"

type LoaderProps = React.ComponentPropsWithoutRef<"span"> & {
  size?: number | string
  color?: string
  label?: string
}

type LoadingScreenProps = React.ComponentPropsWithoutRef<"div"> & {
  label?: string
  loaderColor?: string
  loaderSize?: number | string
}

function Loader({
  className,
  color,
  label = "Laddar",
  size,
  style,
  ...props
}: LoaderProps) {
  const loaderStyle = {
    ...(size != null
      ? { "--loader-size": typeof size === "number" ? `${size}px` : size }
      : null),
    ...(color ? { "--loader-color": color } : null),
    ...style,
  } as React.CSSProperties

  return (
    <span
      aria-label={label}
      className={cn("loader", className)}
      role="status"
      style={loaderStyle}
      {...props}
    >
      {label}
    </span>
  )
}

function LoadingScreen({
  className,
  label = "Laddar",
  loaderColor,
  loaderSize,
  ...props
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh items-center justify-center bg-white px-6",
        className
      )}
      {...props}
    >
      <Loader color={loaderColor} label={label} size={loaderSize} />
    </div>
  )
}

export { Loader, LoadingScreen }

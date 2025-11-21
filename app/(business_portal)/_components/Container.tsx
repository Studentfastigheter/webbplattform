"use client";
import { twMerge } from "tailwind-merge";

enum PaddingOptions {
    none = "p-0",
    xs = "p-2",
    sm = "p-4",
    normal = "p-6",
    lg = "p-8",
    xl = "p-10",
}

enum BorderStyles {
    solid = "border-solid",
    dashed = "border-dashed",
}

export default function Container(
    {
        children,
        columnSpan = 3,
        rowSpan = 1,
        padding = "normal",
        borderStyle = "solid",
        className,
        onClick,
    }:
    {
        children: React.ReactNode,
        columnSpan?: number,
        rowSpan?: number,
        padding?: keyof typeof PaddingOptions,
        borderStyle?: keyof typeof BorderStyles,
        className?: string,
        onClick?: () => void,
    }
) {
    return (
        <div onClick={onClick} style={{"gridColumn": `span ${columnSpan}`, "gridRow": `span ${rowSpan}`}} className={twMerge(`bg-white m-2 relative rounded-lg border border-neutral-200 ${onClick ? "select-none cursor-pointer" : ""} ${borderStyle == "solid" ? "shadow-sm" : ""} ${PaddingOptions[padding]} ${BorderStyles[borderStyle]}`, className)}>
            {children}
        </div>
    )
}
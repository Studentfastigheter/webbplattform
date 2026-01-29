"use client";
import React from "react";
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


type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode,
    padding?: keyof typeof PaddingOptions,
    borderStyle?: keyof typeof BorderStyles,
    className?: string,
    onClick?: React.MouseEventHandler<HTMLDivElement>,
}

export default function Container(
    {
        children,
        padding = "normal",
        borderStyle = "solid",
        className,
        onClick,
        ...props
    }: ContainerProps
    
) {
    return (
        <div {...props} onClick={onClick} className={twMerge(`bg-white m-2 relative rounded-lg border border-neutral-200 ${onClick ? "select-none cursor-pointer" : ""} ${borderStyle == "solid" ? "shadow-sm" : ""} ${PaddingOptions[padding]} ${BorderStyles[borderStyle]}`, className)}>
            {children}
        </div>
    )
}
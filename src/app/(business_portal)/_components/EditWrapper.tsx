"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useState } from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    className?: string;
    tooltip?: string;
    isEditable?: boolean;
};

export default function EditWrapper({
    children,
    className,
    tooltip = "Redigera",
    isEditable = false,
    ...props
}: Props) {

    const [isHovered, setIsHovered] = useState(false);

    return (
        isEditable ? (
            <div 
                className={cn("group relative cursor-pointer", className)} 
                {...props}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
                <div className="invisible group-hover:visible group-hover:bg-neutral-100/30 absolute top-4 right-4 rounded-full p-2">
                    <Pencil className="text-neutral-800 w-6 h-6" />

                    {/* Tooltip bubblan */}
                    <div className="
                        pointer-events-none absolute left-1/2 top-full mt-2
                        -translate-x-1/2
                        rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white shadow-md
                        opacity-0 group-hover:opacity-100 transition whitespace-nowrap
                    ">
                        {tooltip}

                        {/* Arrow */}
                        <div className="
                        absolute left-1/2 top-0
                        -translate-x-1/2 -translate-y-1/2
                        h-2 w-2 rotate-45 bg-neutral-900
                        " />
                    </div>
                </div>
            </div>
        ) : (
            <div className={className} {...props}>
                {children}
            </div>
        )
    );
}
"use client";

import { Plus, RotateCcw, Trash, TriangleAlert } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { TooltipButton } from "@/components/Dashboard/TooltipButton";
import { FileCardClientItem } from "@/lib/definitions";

type ItemCardProps = {
    item: FileCardClientItem;
    isHovered: boolean;
    onHoverEnter: () => void;
    onHoverLeave: () => void;
    onRemove: (id: string) => void;
    onRetry: (id: string) => Promise<boolean>;
    onEdit: (id: string, metadata: Record<string, any>) => Promise<boolean>;
    icon: React.ReactNode;
    FormComponent: React.ComponentType<any>;
};

export default function ItemCard({
    item,
    isHovered,
    onHoverEnter,
    onHoverLeave,
    onRemove,
    onRetry,
    onEdit,
    icon,
    FormComponent,
}: ItemCardProps) {
    const isHoveredAndError = isHovered && item.status === "error";

    return (
        <FormComponent
            id={item.id}
            displayName={item.displayName}
            metadata={item.metadata}
            handleEdit={onEdit}
            status={item.status}
        >
            <div
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (!(item.status === "error")) return;
                    e.stopPropagation();
                }}
                onMouseEnter={onHoverEnter}
                onMouseLeave={onHoverLeave}
                className={cn(
                    item.status == "default" && "border-neutral-300 hover:border-neutral-500",
                    item.status == "error" && "border-red-300 hover:border-red-500",
                    "relative w-24 h-24 aspect-square cursor-pointer border rounded-lg p-1 flex flex-col items-center justify-center"
                )}
            >
                <div className={cn(isHoveredAndError && "blur")}>
                    {React.isValidElement(icon) && React.cloneElement(icon, { size: 24 } as any)}
                </div>
                {item.status === "error" && (
                    <TriangleAlert size={16} className={cn(isHoveredAndError && "blur", "text-red-300 absolute -top-0.5 right-0 -translate-x-1/2 translate-y-1/2")} />
                )}
                {isHoveredAndError && (
                    <TooltipButton
                        tooltip="Ta bort"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.id);
                        }}
                        unstyled
                        sideOffset={24}
                    >
                        <Trash size={24} className="text-red-800 absolute top-1/2 -translate-y-1/2 left-[45%] -translate-x-full" />
                    </TooltipButton>
                )}
                {isHoveredAndError && (
                    <TooltipButton
                        tooltip="Prova igen"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRetry(item.id);
                        }}
                        unstyled
                        sideOffset={24}
                    >
                        <RotateCcw size={24} className="text-blue-800 absolute top-1/2 -translate-y-1/2 left-[55%]" />
                    </TooltipButton>
                )}
                <p className={cn(isHoveredAndError && "blur", "text-xs text-center mt-1.5 line-clamp-2 break-words max-w-full")}>{item.displayName}</p>
            </div>
        </FormComponent>
    );
}


export function ItemCreateButton({ 
    onCreate, 
    FormComponent
}: { 
    onCreate: (metadata: Record<string, any>) => Promise<boolean>;
    FormComponent: React.ComponentType<any>;
}) {
    return (
        <FormComponent handleCreate={onCreate}>
            <div
                className={cn(
                    "relative w-24 h-24 aspect-square cursor-pointer border rounded-lg p-1 flex flex-col items-center justify-center border-dashed border-neutral-500 hover:border-neutral-700"
                )}
            >
                <Plus size={32} />
            </div>
        </FormComponent>
    );
}
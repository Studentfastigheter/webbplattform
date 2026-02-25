"use client";

import React from "react";
import { Plus } from "lucide-react";
import ItemCard from "./FileCard";
import { FileCardClientItem } from "@/lib/definitions";

type ItemListClientProps = {
    items: FileCardClientItem[];
    itemsHovered: string[];
    onHoverEnter: (id: string) => void;
    onHoverLeave: (id: string) => void;
    onRemove: (id: string) => void;
    onRetry: (id: string) => Promise<boolean>;
    onEdit: (id: string, metadata: Record<string, any>) => Promise<boolean>;
    icon: React.ReactNode;
    FormComponent: React.ComponentType<any>;
};

export function ItemCreateButton({ 
    onCreate, 
    FormComponent 
}: { 
    onCreate: (metadata: Record<string, any>) => Promise<boolean>;
    FormComponent: React.ComponentType<any>;
}) {
    return (
        <FormComponent handleCreate={onCreate}>
            <div className="w-24 h-24 aspect-square cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-500 rounded-lg p-4 flex flex-col items-center justify-center">
                <Plus size={32} />
            </div>
        </FormComponent>
    );
}

export default function ItemListClient({
    items,
    itemsHovered,
    onHoverEnter,
    onHoverLeave,
    onRemove,
    onRetry,
    onEdit,
    icon,
    FormComponent,
}: ItemListClientProps) {
    return (
        <>
            {items?.map((item) => (
                <ItemCard
                    key={item.id}
                    item={item}
                    isHovered={itemsHovered.includes(item.id)}
                    onHoverEnter={() => onHoverEnter(item.id)}
                    onHoverLeave={() => onHoverLeave(item.id)}
                    onRemove={onRemove}
                    onRetry={onRetry}
                    onEdit={onEdit}
                    icon={icon}
                    FormComponent={FormComponent}
                />
            ))}
        </>
    );
}

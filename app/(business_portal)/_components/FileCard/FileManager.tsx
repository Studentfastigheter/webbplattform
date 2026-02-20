"use client";

import { useCallback, useState, Suspense } from "react";
import { FloorplanSkeleton } from "@/components/Dashboard/Skeletons";
import FileListInitializer from "./FileListInitializer";
import { FileCardClientItem, FileCardServerItem } from "@/lib/definitions";
import { ItemCreateButton } from "./FileCard";

type ItemManagerProps = {
    itemsPromise: Promise<FileCardServerItem[]>;
    icon: React.ReactNode;
    FormComponent: React.ComponentType<any>;
    onSubmit: (metadata: Record<string, any>, itemId?: string) => Promise<{ success: boolean; id?: string }>;
};

export default function FileManager({ 
    itemsPromise, 
    icon, 
    FormComponent,
    onSubmit,
}: ItemManagerProps) {
    const [items, setItems] = useState<FileCardClientItem[]>([]);
    const [itemsHovered, setItemsHovered] = useState<string[]>([]);

    const handleInitialize = useCallback((serverItems: FileCardServerItem[]) => {
        setItems(
            serverItems.map((item) => ({
                id: item.id,
                displayName: item.displayName,
                metadata: item.metadata || {},
                status: "default" as const,
            }))
        );
    }, []);

    const handleCreate = useCallback(
        async (metadata: Record<string, any>): Promise<boolean> => {
            const optimisticId = crypto.randomUUID();

            setItems((prev) => [
                {
                    id: optimisticId,
                    displayName: metadata?.displayName,
                    metadata,
                    status: "uploading",
                },
                ...prev,
            ]);

            try {
                const result = await onSubmit(metadata);
                
                if (result.success) {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === optimisticId
                                ? { ...item, id: result.id || optimisticId, status: "default" }
                                : item
                        )
                    );
                    return true;
                } else {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === optimisticId
                                ? { ...item, status: "error", errorMessage: "Något gick fel" }
                                : item
                        )
                    );
                    return false;
                }
            } catch (error) {
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === optimisticId
                            ? { ...item, status: "error", errorMessage: "Något gick fel" }
                            : item
                    )
                );
                return false;
            }
        },
        [onSubmit]
    );

    const handleRetry = useCallback(
        async (id: string): Promise<boolean> => {
            let itemMetadata: Record<string, any> | undefined;

            setItems((prev) => {
                const current = prev.find((item) => item.id === id);
                itemMetadata = current?.metadata;
                return prev.map((item) =>
                    item.id === id ? { ...item, status: "uploading", errorMessage: undefined } : item
                );
            });

            if (!itemMetadata) return false;

            try {
                const result = await onSubmit(itemMetadata, id);
                
                if (result.success) {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === id ? { ...item, status: "default" } : item
                        )
                    );
                    return true;
                } else {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === id
                                ? { ...item, status: "error", errorMessage: "Något gick fel" }
                                : item
                        )
                    );
                    return false;
                }
            } catch (error) {
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? { ...item, status: "error", errorMessage: "Något gick fel" }
                            : item
                    )
                );
                return false;
            }
        },
        [onSubmit]
    );

    const handleRemove = useCallback((id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const handleEdit = useCallback(
        async (id: string, metadata: Record<string, any>): Promise<boolean> => {
            setItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { 
                            ...item, 
                            displayName: metadata?.displayName || item.displayName,
                            metadata,
                            status: "uploading", 
                            errorMessage: undefined 
                          }
                        : item
                )
            );

            try {
                const result = await onSubmit(metadata, id);
                
                if (result.success) {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === id ? { ...item, status: "default" } : item
                        )
                    );
                    return true;
                } else {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.id === id
                                ? { ...item, status: "error", errorMessage: "Något gick fel" }
                                : item
                        )
                    );
                    return false;
                }
            } catch (error) {
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? { ...item, status: "error", errorMessage: "Något gick fel" }
                            : item
                    )
                );
                return false;
            }
        },
        [onSubmit]
    );

    return (
        <div className="flex gap-3 mt-1">
            <ItemCreateButton onCreate={handleCreate} FormComponent={FormComponent} />
            <Suspense fallback={Array.from({ length: 3 }).map((_, i) => <FloorplanSkeleton key={i} />)}>
                <FileListInitializer
                    itemsPromise={itemsPromise}
                    items={items}
                    itemsHovered={itemsHovered}
                    onHoverEnter={(id: string) => setItemsHovered((prev: string[]) => [...prev, id])}
                    onHoverLeave={(id: string) => setItemsHovered((prev: string[]) => prev.filter(itemId => itemId !== id))}
                    onRemove={handleRemove}
                    onRetry={handleRetry}
                    onEdit={handleEdit}
                    icon={icon}
                    FormComponent={FormComponent}
                    onInitialize={handleInitialize}
                />
            </Suspense>
        </div>
    );
}

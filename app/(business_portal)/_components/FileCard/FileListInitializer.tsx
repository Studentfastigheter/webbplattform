import { use, useEffect, useRef } from "react";
import { FileCardServerItem } from "@/lib/definitions";
import FileList from "./FileList";

type FileListInitializerProps = {
    itemsPromise: Promise<FileCardServerItem[]>;
    items: any[];
    itemsHovered: string[];
    onHoverEnter: (id: string) => void;
    onHoverLeave: (id: string) => void;
    onRemove: (id: string) => void;
    onRetry: (id: string) => Promise<boolean>;
    onEdit: (id: string, metadata: Record<string, any>) => Promise<boolean>;
    icon: React.ReactNode;
    FormComponent: React.ComponentType<any>;
    onInitialize: (items: FileCardServerItem[]) => void;
};

export default function FileListInitializer({
    itemsPromise,
    onInitialize,
    ...props
}: FileListInitializerProps) {
    const serverItems = use(itemsPromise);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            onInitialize(serverItems);
            hasInitialized.current = true;
        }
    }, [serverItems, onInitialize]);

    return <FileList {...props} />;
}
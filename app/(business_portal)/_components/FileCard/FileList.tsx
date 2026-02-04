import { FileCardClientItem, FileCardServerItem } from "@/lib/definitions";
import ItemCard from "./FileCard";

type FileListProps = {
    itemsPromise?: Promise<FileCardServerItem[]>;
    items?: FileCardClientItem[];
    itemsHovered: string[];
    onHoverEnter: (id: string) => void;
    onHoverLeave: (id: string) => void;
    onRemove: (id: string) => void;
    onRetry: (id: string) => Promise<boolean>;
    onEdit: (id: string, metadata: Record<string, any>) => Promise<boolean>;
    icon: React.ReactNode;
    FormComponent: React.ComponentType<any>;
};

export default function FileList({ 
    itemsPromise,
    items,
    itemsHovered,
    onHoverEnter,
    onHoverLeave,
    onRemove,
    onRetry,
    onEdit,
    icon,
    FormComponent
}: FileListProps) {
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
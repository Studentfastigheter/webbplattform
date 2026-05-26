"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import React, { useMemo, useState } from "react";

type ImageProps = {
    imageId: string;
    src: string;
    alt: string;
    clr: string;
}

type Props = React.HTMLAttributes<HTMLDivElement> & {  
    image: ImageProps;
    sortable?: boolean;
    order?: number;
    setIsDragging?: React.Dispatch<React.SetStateAction<string | null>>;
    isDragging?: string | null;
    className?: string;
    onSwitch?: (firstImageId: string, secondImageId: string) => void;
    onUnselect?: (imageId: string) => void;
};

export default function UploadGalleryImage({
    image,
    sortable = false,
    order,
    className,
    isDragging,
    setIsDragging,
    onSwitch,
    onUnselect,
    ...props
}: Props) {

    function handleMouseDown() {
        if (sortable && setIsDragging && isDragging == null) {
            setIsDragging(image.imageId);
        }
    }

    function handleMouseUp() {
        if (sortable && setIsDragging) {
            setIsDragging(null);
            if (isDragging === image.imageId) return;
            
            if (isDragging && isHovering) {
                onSwitch?.(image.imageId, isDragging!);
            }
        }
    }

    const [isHovering, setIsHovering] = useState(false);

    

    return (
        <div 
            {...props} 
            className={cn(`relative select-none cursor-pointer p-2 border border-dashed border-gray-300/0 rounded`, className, sortable && isDragging == null && "hover:border-gray-300/80 cursor-grab", sortable && isDragging !== null && isDragging !== image.imageId && "hover:border-gray-700 cursor-grabbing", sortable && isDragging === image.imageId && "border-gray-700 bg-gray-100 cursor-grabbing")}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* <Image 
                src={image.src} 
                alt={image.alt} 
                width={200} 
                height={200} 
                className={`rounded`}
                draggable={false}
            /> */}
            <div className="w-[150px] h-[150px] rounded" style={{backgroundColor: image.clr}} />
            {
                order && (
                    <>
                        <div className="absolute top-1 left-1 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium border border-gray-300">
                            {order}
                        </div>
                        <X 
                            className="absolute top-1 right-1 w-5 h-5 text-gray-500 hover:text-gray-800 transition cursor-pointer" 
                            onClick={() => onUnselect?.(image.imageId)}
                        />
                    </>
                )
            }
        </div>
    );
}
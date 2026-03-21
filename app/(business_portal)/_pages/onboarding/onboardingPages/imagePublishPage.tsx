"use client";

import EditWrapper from "@/app/(business_portal)/_components/EditWrapper";
import ImageUploadGallery from "@/components/Dashboard/ImageUploadGallery";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";


const images = [
    { src: "/appartment.jpg", alt: "Bild 1" },
    { src: "/appartment.jpg", alt: "Bild 2" },
    { src: "/appartment.jpg", alt: "Bild 3" },
    { src: "/appartment.jpg", alt: "Bild 4" },
    { src: "/appartment.jpg", alt: "Bild 5" },
]

const mainImage = images[0]
const miscImages = images.slice(1)


export default function ImagePublishPage() {

    const [open, setOpen] = useState(false);



    function handleImageClick(index: number) {
        setOpen(true);
    }

    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-xl space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-medium">Välj minst fem foton</h1>
                        <p className="text-sm text-neutral-600">Dra för att omorganisera</p>
                    </div>
                    <div onClick={() => setOpen(true)} className="cursor-pointer ml-auto p-2 -mr-4">
                        <Plus className="mr-2" />
                    </div>
                </div>
                
                <div className="flex h-full flex-col">

                    <EditWrapper
                        onClick={() => handleImageClick(0)}
                        tooltip="Redigera bild"
                        isEditable={true}
                    >
                        <div className="h-[150px] cursor-pointer relative overflow-hidden rounded-3xl shadow-[0_15px_45px_rgba(0,0,0,0.08)] sm:h-[200px] lg:h-[320px]">
                        <Image
                            src={mainImage.src}
                            alt={mainImage.alt}
                            fill
                            priority
                            sizes="(min-width: 1024px) 800px, 100vw"
                            className="object-cover"
                        />
                        </div>
                    </EditWrapper>
                    
                    <div className="mt-8 grid h-[260px] grid-cols-2 grid-rows-2 gap-4 sm:h-[340px] lg:h-[420px]">
                        {miscImages.map((image, idx) => (
                            <EditWrapper
                                key={`${image.src}-${idx}`}
                                onClick={() => handleImageClick(idx)}
                                tooltip="Redigera bild"
                                isEditable={true}
                            >
                                <div className="h-full relative cursor-pointer overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.05)] group">
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        sizes="(min-width: 1024px) 400px, 50vw"
                                        className="object-cover"
                                    />
                                </div>
                            </EditWrapper>
                        ))}
                    </div>
                </div>
                <ImageUploadGallery
                    open={open}
                    setOpen={setOpen}
                />
            </div>
        </div>
    )
}
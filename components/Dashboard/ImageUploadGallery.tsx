"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Dispatch, useState } from "react";
import UploadGalleryImage from "./UploadGalleryImage"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList } from "../ui/tabs"
import { TabsTrigger } from "@radix-ui/react-tabs"
import DragAndDrop from "@/app/(business_portal)/_components/DragAndDrop";
import { Progress } from "../ui/progress";
import { progress } from "framer-motion";
import { File } from "lucide-react";




function randomColor() {
    return `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`;
}


const imageIds = {
    "img1": {
        src: "/appartment.jpg",
        alt: "Apartment",
        clr: randomColor()
    },
    "img2": {
        src: "/appartment.jpg",
        alt: "Apartment",
        clr: randomColor()
    },
    "img3": {
        src: "/appartment.jpg",
        alt: "Apartment",
        clr: randomColor()
    },
    "img4": {
        src: "/appartment.jpg",
        alt: "Apartment",
        clr: randomColor()
    },
    "img5": {
        src: "/appartment.jpg",
        alt: "Apartment",
        clr: randomColor()
    },
    "img6": {
        src: "/appartment.jpg",
        alt: "Apartment",
        clr: randomColor()
    },
    "img7": {
        src: "/appartment.jpg",
        alt: "Apartment",
        clr: randomColor()
    },
    "img8": {
        src: "/appartment.jpg",
        alt: "Apartment",
        clr: randomColor()
    },
} as const;

const imagesUploading = [
    {
        name: "minbild.jpg",
        progress: 45
    },
    {
        name: "andrabild.png",
        progress: 80,
        error: "Filen är för stor"
    },
    {
        name: "tredjebild.jpeg",
        progress: 100
    },
    {
        name: "fjardebild.jpg",
        progress: 20
    },
    {
        name: "femtebild.png",
        progress: 60
    },
    {
        name: "sjattebild.jpeg",
        progress: 100
    },
    {
        name: "sjunde bild.jpg",
        progress: 10
    }
];




const MAX_SELECTED_IMAGES = 5;



type Props = {  
    open: boolean;
    setOpen: Dispatch<React.SetStateAction<boolean>>;
};

export default function ImageUploadGallery({
    open,
    setOpen
}: Props) {

    function handleImageClick(imageId: string, isSelected: boolean) {
        if (!isSelected) {
            if (selectedImages.length < MAX_SELECTED_IMAGES) {
                if (!selectedImages.includes(imageId)) {
                    setSelectedImages([...selectedImages, imageId]);
                } else {
                    setSelectedImages(selectedImages.filter(id => id !== imageId));
                }
            } else {
                toast.error(`Du kan bara välja upp till ${MAX_SELECTED_IMAGES} bilder.`);
            }
        }
    }

    function handleSwitchImageOrder(firstImageId: string, secondImageId: string) {
        const firstIndex = selectedImages.indexOf(firstImageId);
        const secondIndex = selectedImages.indexOf(secondImageId);
        if (firstIndex === -1 || secondIndex === -1) return;
        const newSelectedImages = [...selectedImages];
        newSelectedImages[firstIndex] = secondImageId;
        newSelectedImages[secondIndex] = firstImageId;
        setSelectedImages(newSelectedImages);
    }


    function handleImageSave() {
        toast.success("Dina bildändringar har sparats.");
        setOpen(false);
    }

    function handleUnselectImage(imageId: string) {
        setSelectedImages(selectedImages.filter(id => id !== imageId));
    }

    // States for image selection and dragging
    const [selectedImages, setSelectedImages] = useState<string[]>([]); // List of image ids
    const [isDragging, setIsDragging] = useState<string | null>(null);

    // State for upload progress
    const [progress, setProgress] = useState(0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[1025px] max-h-11/12 overflow-auto">
                <Tabs defaultValue="images">
                    <TabsList className="flex rounded-lg mb-4">
                        <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:shadow cursor-pointer px-2 py-1 text-sm rounded-md text-black" value="images">Bilder</TabsTrigger>
                        <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:shadow cursor-pointer px-2 py-1 text-sm rounded-md text-black" value="upload">Ladda upp</TabsTrigger>
                    </TabsList>
                    <TabsContent value="images">
                        <DialogHeader>
                            <DialogTitle>Redigera bilder</DialogTitle>
                            <DialogDescription>
                                Gör ändringar i dina bilder här. Klicka på spara när du är klar.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="relative mt-4">
                            <div>
                                <h3 className="font-medium">Valda bilder</h3>
                                <div className="grid py-4 grid-cols-5">
                                    {
                                        selectedImages.length === 0 ? (
                                            <p className="text-sm text-gray-500 col-span-5">Inga bilder valda</p>
                                        ) : (
                                            selectedImages.map((imageId) => {
                                                const image = imageIds[imageId as keyof typeof imageIds];
                                                return (
                                                    <UploadGalleryImage
                                                        key={imageId}
                                                        onClick={() => handleImageClick(imageId, true)}
                                                        image={{ imageId, ...image }}
                                                        sortable
                                                        order={selectedImages.indexOf(imageId) + 1}
                                                        setIsDragging={setIsDragging}
                                                        isDragging={isDragging}
                                                        onSwitch={handleSwitchImageOrder}
                                                        onUnselect={() => handleUnselectImage(imageId)}
                                                    />
                                                );
                                            }
                                        ))
                                    }
                                </div>
                            </div>

                            <div className="mt-4">
                                <h3 className="font-medium">Alla uppladdade bilder</h3>
                                <div className="grid py-4 grid-cols-5">
                                    {
                                        Object.entries(imageIds).filter(
        ([key]) => !selectedImages.includes(key)).map(([imageId, image]) => {
                                            return (
                                                <UploadGalleryImage
                                                    key={imageId}
                                                    onClick={() => handleImageClick(imageId, false)}
                                                    image={{imageId, ...image}}
                                                />
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Avbryt</Button>
                            </DialogClose>
                            <Button onClick={handleImageSave}>Spara ändringar</Button>
                        </DialogFooter>
                    </TabsContent>
                    <TabsContent value="upload">
                        <DialogHeader>
                            <DialogTitle>Ladda upp bilder</DialogTitle>
                            {/* <DialogDescription>
                                Ladda upp nya bilder här.
                            </DialogDescription> */}
                        </DialogHeader>

                        <div className="relative mt-4 max-h-[300px]">
                            <div className="flex py-4 gap-2 items-start">
                                    <DragAndDrop 
                                        className="m-0 flex-2 sticky top-0"
                                        title="Släpp dina bilder här!"
                                        description="Ladda upp flera bilder samtidigt."
                                    />
                                    <div className="flex-3 flex flex-col gap-2">
                                        {
                                            imagesUploading.map(({name, progress, error}, idx) => {

                                                const isCompleted = progress === 100;

                                                const successColor = "green-600";
                                                const errorColor = "red-600";
                                                const normalColor = "neutral-400";

                                                const fileNameStyle = error ? `text-${errorColor}` : `text-${normalColor}`;
                                                const actionStyle = error ? `text-${errorColor} hover:underline cursor-pointer` : isCompleted ? `text-${successColor}` : `text-${normalColor} hover:underline cursor-pointer`;
                                                const progressStyle = error ? `[&>div]:bg-${errorColor}` : `[&>div]:bg-${successColor}`;
                                                
                                                return  (
                                                    <div className="border border-neutral-400/10 rounded px-6 py-4 flex gap-4">
                                                        <File />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <p className={`${fileNameStyle} ${error ? "font-bold" : ""}`}>
                                                                    {error ? error : `resume.jpg (${progress}%)`}
                                                                </p>
                                                                <button className={`${actionStyle} font-medium`}>{isCompleted ? "Klar" : "Avbryt"}</button>
                                                            </div>
                                                            <Progress 
                                                                value={progress} 
                                                                className={`mt-2 mb-1.5 bg-neutral-300 ${progressStyle}`}
                                                                
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

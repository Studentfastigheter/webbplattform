"use client";
import { FormGroup, FormShell } from "@/components/Dashboard/Form";
import { CloudUpload, Plus, RotateCcw, SquaresSubtract, Trash, TriangleAlert } from "lucide-react";
import FloorplanForm from "../_components/FloorplanForm";
import { Floorplan } from "../portal/installningar/page";
import React, { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TooltipButton } from "@/components/Dashboard/TooltipButton";


export type ClientFloorplan = Floorplan & {
  status: "default" | "uploading" | "error";
  errorMessage?: string;
};

type SettingsProps = {
    fetchedFloorplans: Floorplan[];
}

type UploadFloorplanParams = {
    alias: string;
    file: File;
    optimisticId: string;
    setFloorplans: React.Dispatch<React.SetStateAction<ClientFloorplan[]>>;
}

function uploadFloorplan({
    alias,
    file,
    optimisticId,
    setFloorplans,
}: UploadFloorplanParams) {

    setFloorplans((prev) =>
        prev.map((fp) =>
            fp.id === optimisticId ? { ...fp, status: "uploading", errorMessage: undefined } : fp
        )
    );

    // try {
    //     const formData = new FormData();
    //     formData.append("alias", alias);
    //     formData.append("file", file);

    //     const res = await fetch("/api/floorplans", {
    //         method: "POST",
    //         body: formData,
    //     });

    //     if (!res.ok) {
    //         throw new Error("Failed to upload floorplan");
    //     }

    //     // If server returns created object, you can merge it in.
    //     // Here we'll assume server returns: { id, alias, fileName }
    //     const created = (await res.json()) as Floorplan;

    //     setFloorplans((prev) =>
    //         prev.map((fp) =>
    //             fp.id === optimisticId
    //             ? { ...fp, ...created, status: "ready", errorMessage: undefined }
    //             : fp
    //         )
    //     );

    //     return true;
    // } catch (err) {
    //     const message =
    //     err instanceof Error ? err.message : "Something went wrong";

    //     // Mark as error (or remove it if you prefer hard rollback)
    //     setFloorplans((prev) =>
    //     prev.map((fp) =>
    //         fp.id === optimisticId
    //         ? { ...fp, status: "error", errorMessage: message }
    //         : fp
    //     )
    //     );

    //     return false;
    // }



    // Mock database delay
    return new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
        // Mock success response
        return false;
    }).then((success) => {
        if (success) {
            setFloorplans((prev) =>
                prev.map((fp) =>
                    fp.id === optimisticId
                    ? { ...fp, status: "default", errorMessage: undefined }
                    : fp
                )
            );
        } else {
            setFloorplans((prev) =>
                prev.map((fp) =>
                    fp.id === optimisticId
                    ? { ...fp, status: "error", errorMessage: "Failed to upload floorplan" }
                    : fp
                )
            );
        }
        return success;
    });
}


export default function Settings({
    fetchedFloorplans,
}: SettingsProps) {

    const [floorplans, setFloorplans] = useState<ClientFloorplan[]>(
        fetchedFloorplans.map((fp) => ({ ...fp, status: "default" }))
    );

    const [floorplansHovered, setFloorplansHovered] = useState<string[]>([]);

    const isUploading = useMemo(() => 
        floorplans.some((f) => f.status === "uploading"
    ), [floorplans]);

    const handleCreateFloorplan = useCallback(
        async (alias: string, file: File): Promise<boolean> => {
        // Stable optimistic id
        const optimisticId = crypto.randomUUID();

        // Optimistic insert
        setFloorplans((prev) => [
            {
                id: optimisticId,
                alias,
                file: file,
                fileName: file.name,
                status: "uploading",
            },
            ...prev,
        ]);

            
        // Upload logic
        const success = await uploadFloorplan({
            alias,
            file,
            optimisticId,
            setFloorplans,
        });

        return success;

        }, []
    );

    const handleRetry = useCallback(
        async (id: string, alias: string, file: File): Promise<boolean> => {
        // Optional helper if you want retry support

        setFloorplans((prev) =>
            prev.map((fp) =>
                fp.id === id ? { ...fp, status: "uploading", errorMessage: undefined } : fp
            )
        );
        
        const success = await uploadFloorplan({
            alias,
            file,
            optimisticId: id,
            setFloorplans,
        });

        return success;

    }, []);

  const handleRemove = useCallback((id: string) => {
    setFloorplans((prev) => prev.filter((fp) => fp.id !== id));
  }, []);

    return (
        
        <div>

            <FormShell title="Inställningar">
            
                <FormGroup title="Planlösningar" gap="sm" className="mb-3">
                    <div className="flex gap-3 mt-1">
                        <FloorplanForm
                            handleCreateFloorplan={handleCreateFloorplan}
                        >
                            <div className="w-24 h-24 aspect-square cursor-pointer border border-dashed border-neutral-300 hover:border-neutral-500 rounded-lg p-4 flex flex-col items-center justify-center">
                                <Plus size={32} />
                            </div>
                        </FloorplanForm>
                        {/* Already created floorplans */}
                        {

                            floorplans?.map((floorplan) => {

                                const isHoveredAndError = floorplansHovered.includes(floorplan.id) && floorplan.status === "error";
                                
                                return (
                                <FloorplanForm
                                    key={floorplan.id}
                                    alias={floorplan.alias}
                                    fileName={floorplan.file.name}
                                    handleCreateFloorplan={handleCreateFloorplan}
                                >
                                    <div 
                                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                            // For error state, click should retry upload
                                            if (!(floorplan.status === "error")) return;
                                            e.stopPropagation();
                                            
                                        }}
                                        onMouseEnter={() => setFloorplansHovered((prev) => [...prev, floorplan.id])}
                                        onMouseLeave={() => setFloorplansHovered((prev) => prev.filter(id => id !== floorplan.id))}
                                        className={cn(floorplan.status == "default" && "border-neutral-300 hover:border-neutral-500", floorplan.status == "error" && "border-red-300 hover:border-red-500", "relative w-24 h-24 aspect-square cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center")}
                                    >
                                        <SquaresSubtract size={24} className={cn(isHoveredAndError && "blur")} />
                                        {floorplan.status === "error" && (<TriangleAlert size={16} className={cn(isHoveredAndError && "blur", "text-red-300 absolute -top-0.5 right-0 -translate-x-1/2 translate-y-1/2")} />)}
                                        {/* {floorplan.status === "uploading" && (<CloudUpload size={16} className="text-blue-300 absolute -top-0.5 right-0 -translate-x-1/2 translate-y-1/2" />)} */}
                                        {isHoveredAndError && 
                                            <TooltipButton
                                                tooltip="Ta bort"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemove(floorplan.id);
                                                }}
                                                unstyled
                                                sideOffset={24}
                                            >
                                                <Trash size={24} className="text-red-800 absolute top-1/2 -translate-y-1/2 left-[45%] -translate-x-full" />
                                            </TooltipButton>
                                        }
                                        {isHoveredAndError && 
                                            <TooltipButton
                                                tooltip="Prova igen"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRetry(floorplan.id, floorplan.alias, floorplan.file);
                                                }}
                                                unstyled
                                                sideOffset={24}
                                            >
                                                <RotateCcw size={24} className="text-blue-800 absolute top-1/2 -translate-y-1/2 left-[55%]" />
                                            </TooltipButton>
                                            
                                        }
                                        <p className={cn(isHoveredAndError && "blur", "text-xs text-center break-words mt-1.5")}>{floorplan.alias}</p>
                                    </div>
                                </FloorplanForm>
                            )})
                        }
                        
                    </div>
                </FormGroup>
                    
            </FormShell>

        </div>
    )
}
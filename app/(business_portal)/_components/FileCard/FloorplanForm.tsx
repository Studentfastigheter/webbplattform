"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Upload, X, FileText } from "lucide-react"
import { toast } from "sonner"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const defaultFileTypes = [
    ["pdf", "application/pdf"],
    ["jpg", "image/jpeg"],
] as const

const defaultMaxSizeMb = 10

type Props = {
    children: React.ReactNode
    fileTypes?: typeof defaultFileTypes;
    displayName?: string;
    maxSizeMb?: number;
    id?: string;
    metadata?: Record<string, any>;
    handleCreate?: (metadata: Record<string, any>) => Promise<boolean>;
    handleEdit?: (id: string, metadata: Record<string, any>) => Promise<boolean>;
    status?: "default" | "uploading" | "error";
}

export default function FileForm({ 
        children,
        fileTypes = defaultFileTypes,
        maxSizeMb = defaultMaxSizeMb,
        id,
        displayName,
        metadata,
        handleCreate,
        handleEdit,
        status="default",
    }: Props) {

    const accept = fileTypes.map(([, mime]) => mime).join(", ")

    // Dialog open state
    const [open, setOpen] = useState(false)

    // Form state
    const [name, setName] = useState(displayName ?? "")

    // File state
    const [file, setFile] = useState<File | null>(null)
    const [fileNameState, setFileNameState] = useState(metadata?.fileName ?? "")

    useEffect(() => {
        if (!file) return

        setFileNameState((prev: string) =>
            file.name !== null ? file.name : prev
        )
    }, [file])

    function handleOpenChange(isOpen: boolean) {
        if (isOpen && status == "error") return
        setName(displayName ?? "")
        setFileNameState(metadata?.fileName ?? "")
        setOpen(isOpen)
    }

    useEffect(() => {
        if (status !== "default" && open) {
            setOpen(false)
        }
    }, [status, open])

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null
        if (!f) {
            setFile(null)
            return
        }

        // Validera filtyp
        if (accept.indexOf(f.type) === -1) {
            toast.error("Välj ett av följande format: " + fileTypes.map(([ext]) => "." + ext).join(", ") + ".")
            e.target.value = ""
            return
        }

        // Validera storlek
        const maxBytes = maxSizeMb * 1024 * 1024
        if (f.size > maxBytes) {
            toast.error(`Filen är för stor. Max ${maxSizeMb} MB.`)
            e.target.value = ""
            return
        }

        setFile(f)

        // Autofyll namn om tomt
        if (!name.trim()) {
            const base = f.name.replace(/\.[^/.]+$/, "")
            setName(base)
        }
    }

    function clearFile() {
        setFile(null)
    }

    function handleUndo() {
        // Placeholder for undo functionality
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        // Basic validering
        if (!name.trim()) {
            toast.error("Ange ett namn på planlösningen.")
            return
        }
        
        // Only require file for create, not for edit
        if (!id && !file) {
            toast.error(`Bifoga en planlösning (${fileTypes.map(([ext]) => ext.toUpperCase()).join(", ")}).`)
            return
        }

        const submissionData = {
            displayName: name,
            file: file!,
        };

        setOpen(false)

        if (id) {
            handleEdit?.(id,{metadata: submissionData}).then((success) => {
                if (success) {
                    toast.success("Planlösningen har uppdaterats", {
                        action: {
                            label: "Ångra",
                            onClick: () => handleUndo(),
                        },
                    })
                } else {
                    toast.error("Något gick fel vid uppdateringen av planlösningen.")
                }
            })
        } else {
            handleCreate?.({metadata: submissionData}).then((success) => {
                if (success) {
                    toast.success("Planlösningen har sparats", {
                        action: {
                            label: "Ångra",
                            onClick: () => handleUndo(),
                        },
                    })
                } else {
                    toast.error("Något gick fel vid sparandet av planlösningen.")
                }
            })
        }

        // Reset
        setFile(null)
        setName("")
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="sm:max-w-[625px] max-h-4/5 overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{id ? "Redigera planlösning" : "Lägg till planlösning"}</DialogTitle>
                        <DialogDescription>
                            Koppla planlösningen till din annons när du skapar eller redigerar den.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 mt-4">
                        <div className="grid gap-3">
                            <Label htmlFor="floorplan_name">Namn</Label>
                            <Input
                                id="floorplan_name"
                                name="floorplan_name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="t.ex. 2 rok, 45 kvm"
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="">Bifoga planlösning</Label>

                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" className="relative overflow-hidden">
                                    <Upload className="" size={16} />
                                    Välj fil
                                    <input
                                        id="floorplan_file"
                                        name="floorplan_file"
                                        type="file"
                                        accept={accept}
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </Button>

                                {fileNameState ? (
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText size={16} />
                                        <span className="max-w-[320px] truncate">{fileNameState}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-7 w-7 p-0"
                                            onClick={clearFile}
                                            aria-label="Ta bort fil"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        Godkända filformat: <span className="font-medium text-black">{fileTypes.map(([ext]) => ext.toUpperCase()).join(", ")}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Avbryt
                            </Button>
                        </DialogClose>
                        <Button type="submit">{id ? "Uppdatera planlösning" : "Spara planlösning"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

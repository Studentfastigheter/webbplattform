"use client"

import * as React from "react"
import { useEffect, useState } from "react"
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


type Props = {
    children: React.ReactNode
    id?: string;
    displayName?: string;
    metadata?: Record<string, any>;
    handleCreate?: (metadata: Record<string, any>) => Promise<boolean>;
    handleEdit?: (id: string, metadata: Record<string, any>) => Promise<boolean>;
    status?: "default" | "uploading" | "error";
}

export default function RequirementProfileForm({ 
        children,
        id,
        displayName,
        metadata,
        handleCreate,
        handleEdit,
        status="default",
    }: Props) {

  // Dialog open state
  const [open, setOpen] = useState(false)

  // Form state
  const [name, setName] = useState(displayName ?? "")
  const [description, setDescription] = useState(metadata?.description ?? "")
  const [minimumAge, setMinimumAge] = useState<string>(metadata?.minimumAge?.toString() ?? "")
  const [maximumAge, setMaximumAge] = useState<string>(metadata?.maximumAge?.toString() ?? "")

  function handleOpenChange(isOpen: boolean) {
    if (isOpen && status == "error") return
    setName(displayName ?? "")
    setDescription(metadata?.description ?? "")
    setMinimumAge(metadata?.minimumAge?.toString() ?? "")
    setMaximumAge(metadata?.maximumAge?.toString() ?? "")
    setOpen(isOpen)
  }

  useEffect(() => {
    if (status !== "default" && open) {
      setOpen(false)
    }
  }, [status, open])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Basic validation
    if (!name.trim()) {
      toast.error("Ange ett namn på kravprofilen.")
      return
    }

    // Validate ages if provided
    const minAge = minimumAge ? parseInt(minimumAge) : undefined
    const maxAge = maximumAge ? parseInt(maximumAge) : undefined

    if (minAge !== undefined && (isNaN(minAge) || minAge < 0)) {
      toast.error("Minsta ålder måste vara ett giltigt nummer.")
      return
    }

    if (maxAge !== undefined && (isNaN(maxAge) || maxAge < 0)) {
      toast.error("Högsta ålder måste vara ett giltigt nummer.")
      return
    }

    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      toast.error("Minsta ålder kan inte vara högre än högsta ålder.")
      return
    }

    const submissionData = {
      displayName: name,
      name,
      description: description.trim() || undefined,
      minimumAge: minAge,
      maximumAge: maxAge,
    }

    setOpen(false)

    if (id) {
      handleEdit?.(id, {metadata: submissionData}).then((success) => {
        if (success) {
          toast.success("Kravprofilen har uppdaterats")
        } else {
          toast.error("Något gick fel vid uppdateringen av kravprofilen.")
        }
      })
    } else {
      handleCreate?.({metadata: submissionData}).then((success) => {
        if (success) {
          toast.success("Kravprofilen har sparats")
        } else {
          toast.error("Något gick fel vid sparandet av kravprofilen.")
        }
      })
    }

    // Reset form
    setName("")
    setDescription("")
    setMinimumAge("")
    setMaximumAge("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[625px] max-h-4/5 overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{id ? "Redigera kravprofil" : "Lägg till kravprofil"}</DialogTitle>
            <DialogDescription>
                Koppla kravprofilen till din annons när du skapar eller redigerar den.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            <div className="grid gap-3">
              <Label htmlFor="requirementProfile_name">Namn *</Label>
              <Input
                id="requirementProfile_name"
                name="requirementProfile_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="t.ex. 2 rok, 45 kvm"
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="requirementProfile_description">Beskrivning</Label>
              <Input
                id="requirementProfile_description"
                name="requirementProfile_description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beskriv kraven för denna profil"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-3">
                <Label htmlFor="requirementProfile_minAge">Minsta ålder</Label>
                <Input
                  id="requirementProfile_minAge"
                  name="requirementProfile_minAge"
                  type="number"
                  min="0"
                  value={minimumAge}
                  onChange={(e) => setMinimumAge(e.target.value)}
                  placeholder="t.ex. 18"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="requirementProfile_maxAge">Högsta ålder</Label>
                <Input
                  id="requirementProfile_maxAge"
                  name="requirementProfile_maxAge"
                  type="number"
                  min="0"
                  value={maximumAge}
                  onChange={(e) => setMaximumAge(e.target.value)}
                  placeholder="t.ex. 65"
                />
              </div>
            </div>
        </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Avbryt
              </Button>
            </DialogClose>
            <Button type="submit">{id ? "Uppdatera kravprofil" : "Spara kravprofil"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

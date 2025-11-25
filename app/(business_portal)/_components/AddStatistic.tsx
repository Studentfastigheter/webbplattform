"use client";
import { Box, CopyPlus } from "lucide-react";
import Container from "./Container";

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
import { Checkbox } from "@/components/ui/checkbox";
import { ORGANISATION_DASHBOARD_STATISTICS } from "@/lib/data";


export default function AddStatistic({
  columnSpan,
}: {
  columnSpan: number;
}) {

  const stat_labels = ORGANISATION_DASHBOARD_STATISTICS
  
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Container columnSpan={columnSpan} padding="sm" borderStyle="dashed" className="hover:!border-solid hover:!shadow-xs transition-all duration-75">
            <CopyPlus size={24} className="text-neutral-400 mb-2 mx-auto" />
            <p className="text-sm text-brand font-bold text-center tracking-wide">Add data</p>
          </Container>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] h-96">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto">
            {
             stat_labels.map((obj, i) => 
                <div className="flex gap-4 p-4 bg-amber-50" key={i}>
                  <Checkbox id={obj.id} />
                  <Label htmlFor={obj.id}>
                    <obj.icon size={14} className="text-neutral-400" />
                    {obj.label}
                  </Label>
                </div>
              )
            }
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className="cursor-pointer" type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
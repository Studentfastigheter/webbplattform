"use client";
import { CopyPlus } from "lucide-react";
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

export default function AddStatistic({
  columnSpan,
}: {
  columnSpan: number;
}) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Container onClick={() => {}} columnSpan={columnSpan} padding="sm" borderStyle="dashed" className="hover:!border-solid hover:!shadow-xs transition-all duration-75">
            <CopyPlus size={24} className="text-neutral-400 mb-2 mx-auto" />
            <p className="text-sm text-brand font-bold text-center tracking-wide">Add data</p>
          </Container>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
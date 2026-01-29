"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type ConfirmButtonProps = {
  /** Text som beskriver handlingen i beskrivningen, t.ex. "ta bort" / "uppdatera status för" */
  actionLabel: string

  /** Hur många objekt som påverkas (för text + disabled) */
  selectedItems?: number

  /** Knappens innehåll (ikon/text) */
  children: React.ReactNode

  /** Tooltip (valfri) */
  tooltipText?: string

  /** Körs när användaren bekräftar. Kan vara async. */
  onConfirm: () => void | Promise<void>

  /** UI-texter (valfria overrides) */
  title?: string
  confirmText?: string
  cancelText?: string

  /** Om du vill kunna disable manuellt */
  disabled?: boolean

  /** Extra className på knappen */
  className?: string

  /** Button variant om du vill (outline som default) */
  variant?: React.ComponentProps<typeof Button>["variant"]
  
}

function pluralizeObjekt(n: number) {
  return n === 1 ? "objekt" : "objekt"
}

export default function ConfirmButton({
  children,
  selectedItems,
  tooltipText,
  actionLabel,
  onConfirm,
  title = "Är du säker?",
  confirmText = "Fortsätt",
  cancelText = "Avbryt",
  disabled,
  className,
  variant = "outline",
}: ConfirmButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const count = selectedItems ?? 0
  const isDisabled = disabled ?? (selectedItems !== undefined && count <= 0)

  const description =
    selectedItems === undefined
      ? `Du håller på att ${actionLabel}. Detta går inte att ångra.`
      : `Du håller på att ${actionLabel} ${count} ${pluralizeObjekt(count)}. Detta går inte att ångra.`

  async function handleConfirm() {
    try {
      setLoading(true)
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const button = (
    <Button
      type="button"
      variant={variant}
      className={cn(className)}
      disabled={isDisabled || loading}
      onClick={() => setOpen(true)}
    >
      {children}
    </Button>
  )

  return (
    <>
      {tooltipText && !isDisabled ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      <AlertDialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Jobbar..." : confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

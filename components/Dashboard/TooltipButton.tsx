"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * TooltipButton
 * - Works with shadcn Button + Tooltip
 * - Supports disabled tooltips (wraps in a span so tooltip still triggers)
 * - Supports rich tooltip (title, description, shortcuts, footer)
 * - Optional "confirm" mode (click twice within a window)
 * - Loading state, icon slots, accessible labeling
 */

const kbdStyles =
  "inline-flex items-center rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground"

const tooltipContentVariants = cva(
  "max-w-[320px] rounded-md border bg-popover px-3 py-2 text-popover-foreground shadow-md",
  {
    variants: {
      density: {
        compact: "px-2 py-1.5",
        normal: "px-3 py-2",
      },
    },
    defaultVariants: {
      density: "normal",
    },
  }
)

export type TooltipButtonShortcut =
  | string
  | { keys: string[]; label?: string } // e.g. { keys: ["⌘", "K"], label: "Search" }

type TooltipButtonConfirm =
  | boolean
  | {
      /** Text shown in tooltip while waiting for second click */
      prompt?: string
      /** Time window for the second click (ms) */
      withinMs?: number
      /** Optional callback to run when entering confirm mode */
      onArmedChange?: (armed: boolean) => void
    }

export type TooltipButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "title"
> &
  VariantProps<typeof tooltipContentVariants> & {
    /** Tooltip text. If omitted, tooltip is disabled. */
    tooltip?: React.ReactNode
    /** Optional richer tooltip pieces */
    tooltipTitle?: React.ReactNode
    tooltipFooter?: React.ReactNode
    /** Optional keyboard shortcut chips displayed in tooltip */
    shortcuts?: TooltipButtonShortcut[]
    /** Tooltip placement */
    side?: React.ComponentProps<typeof TooltipContent>["side"]
    align?: React.ComponentProps<typeof TooltipContent>["align"]
    sideOffset?: number
    /** Delay before showing tooltip */
    delayDuration?: number
    /** If true, tooltip can show even when button is disabled (default true) */
    showWhenDisabled?: boolean
    /**
     * If true, renders TooltipButton as child (for links etc.).
     * Note: in asChild mode, pass your own element as children.
     */
    asChild?: boolean
    /**
     * Optional icon shown left of children.
     * (If you want full control, just pass your own layout in children.)
     */
    leftIcon?: React.ReactNode
    /** Optional icon shown right of children */
    rightIcon?: React.ReactNode
    /** Loading state (adds spinner + disables click) */
    loading?: boolean
    /** Replace tooltip while loading */
    loadingTooltip?: React.ReactNode
    /** If set, requires a second click to confirm */
    confirm?: TooltipButtonConfirm
    /** Tooltip content density */
    density?: "compact" | "normal"
  }

function normalizeShortcuts(shortcuts?: TooltipButtonShortcut[]) {
  if (!shortcuts?.length) return []
  return shortcuts.map((s) => {
    if (typeof s === "string") return { keys: [s] }
    return s
  })
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

export const TooltipButton = React.forwardRef<HTMLButtonElement, TooltipButtonProps>(
  (
    {
      tooltip,
      tooltipTitle,
      tooltipFooter,
      shortcuts,
      side = "top",
      align = "center",
      sideOffset = 8,
      delayDuration = 350,
      showWhenDisabled = true,
      asChild = false,
      leftIcon,
      rightIcon,
      loading = false,
      loadingTooltip,
      confirm = false,
      density,
      disabled,
      onClick,
      className,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const normalizedShortcuts = React.useMemo(
      () => normalizeShortcuts(shortcuts),
      [shortcuts]
    )

    const [armed, setArmed] = React.useState(false)
    const confirmConfig =
      typeof confirm === "object"
        ? {
            prompt: confirm.prompt ?? "Klicka igen för att bekräfta",
            withinMs: confirm.withinMs ?? 2500,
            onArmedChange: confirm.onArmedChange,
          }
        : null

    React.useEffect(() => {
      confirmConfig?.onArmedChange?.(armed)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [armed])

    React.useEffect(() => {
      if (!armed) return
      const within = confirmConfig?.withinMs ?? 2500
      const t = window.setTimeout(() => setArmed(false), within)
      return () => window.clearTimeout(t)
    }, [armed, confirmConfig?.withinMs])

    const isActuallyDisabled = Boolean(disabled) || loading
    const tooltipEnabled =
      tooltip !== undefined ||
      tooltipTitle !== undefined ||
      tooltipFooter !== undefined ||
      normalizedShortcuts.length > 0 ||
      (loading && loadingTooltip !== undefined) ||
      (typeof confirm === "boolean" ? confirm : Boolean(confirmConfig))

    const computedTooltip = React.useMemo(() => {
      if (!tooltipEnabled) return null

      // priority: confirm prompt > loading tooltip > tooltip
      const base =
        armed && confirm
          ? confirmConfig?.prompt ?? "Klicka igen för att bekräfta"
          : loading && loadingTooltip !== undefined
            ? loadingTooltip
            : tooltip

      const hasRich =
        tooltipTitle !== undefined ||
        tooltipFooter !== undefined ||
        normalizedShortcuts.length > 0

      // If user only passed `tooltip` as a node and no rich content, keep it simple.
      if (!hasRich && base != null) {
        return <div className="text-sm">{base}</div>
      }

      return (
        <div className="space-y-2">
          {(tooltipTitle != null || base != null) && (
            <div className="space-y-0.5">
              {tooltipTitle != null ? (
                <div className="text-sm font-medium leading-snug">
                  {tooltipTitle}
                </div>
              ) : null}

              {base != null ? (
                <div className="text-xs text-muted-foreground leading-snug">
                  {base}
                </div>
              ) : null}
            </div>
          )}

          {normalizedShortcuts.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {normalizedShortcuts.map((s, idx) => (
                <span key={idx} className={kbdStyles}>
                  {s.label ? (
                    <span className="mr-1 opacity-80">{s.label}:</span>
                  ) : null}
                  {s.keys.join(" ")}
                </span>
              ))}
            </div>
          ) : null}

          {tooltipFooter != null ? (
            <div className="text-xs text-muted-foreground">{tooltipFooter}</div>
          ) : null}
        </div>
      )
    }, [
      tooltipEnabled,
      armed,
      confirm,
      confirmConfig?.prompt,
      loading,
      loadingTooltip,
      tooltip,
      tooltipTitle,
      tooltipFooter,
      normalizedShortcuts,
    ])

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return

        // Confirm mode: first click arms; second click executes
        if (confirm) {
          if (!armed) {
            setArmed(true)
            return
          }
          setArmed(false)
        }

        onClick?.(e)
      },
      [armed, confirm, disabled, loading, onClick]
    )

    const Comp = asChild ? Slot : Button

    // Important: a disabled button won’t fire pointer events, so TooltipTrigger needs a wrapper.
    const trigger = (
      <Comp
        ref={ref as any}
        className={cn(className)}
        disabled={isActuallyDisabled}
        onClick={handleClick}
        aria-disabled={isActuallyDisabled}
        {...buttonProps}
      >
        <span className="inline-flex items-center gap-2">
          {loading ? <Spinner /> : leftIcon}
          {children}
          {rightIcon}
        </span>
      </Comp>
    )

    if (!tooltipEnabled) {
      return trigger
    }

    const triggerWithDisabledSupport =
      isActuallyDisabled && showWhenDisabled ? (
        // wrapper makes tooltip work even if the button is disabled
        <span className="inline-flex" tabIndex={-1}>
          {trigger}
        </span>
      ) : (
        trigger
      )

    return (
      <TooltipProvider delayDuration={delayDuration}>
        <Tooltip>
          <TooltipTrigger asChild>{triggerWithDisabledSupport}</TooltipTrigger>
          <TooltipContent
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(tooltipContentVariants({ density }))}
            hasArrow={false}
          >
            {computedTooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
)
TooltipButton.displayName = "TooltipButton"

/* ------------------------
Usage examples:

<TooltipButton
  variant="outline"
  tooltip="Arkivera markerade"
  tooltipTitle="Arkivera"
  shortcuts={[{ keys: ["⌘", "A"], label: "Snabbkommando" }]}
  leftIcon={<Archive className="h-4 w-4" />}
  onClick={() => console.log("archive")}
>
  Arkivera
</TooltipButton>

<TooltipButton
  variant="destructive"
  tooltip="Det här går inte att ångra."
  confirm={{ prompt: "Klicka igen för att radera", withinMs: 3000 }}
  onClick={() => console.log("delete")}
>
  Radera
</TooltipButton>

<TooltipButton
  tooltip="Laddar…"
  loading
  loadingTooltip="Hämtar data…"
>
  Spara
</TooltipButton>
------------------------- */

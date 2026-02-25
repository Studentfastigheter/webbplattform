"use client"

import * as React from "react"
import Link from "next/link"
import {
  MessageCircle,
  Building2,
  TrendingUp,
  Bell,
  CheckCheck,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Your current Message type has createdAt = undefined (missing).
// So this component treats createdAt as OPTIONAL and renders a safe fallback.
//
// Recommended (later): add createdAt: string (ISO) to your backend + type.
type MessageKind = "application" | "platform" | "insight"

export type Message = {
  id: string
  text: string
  read: boolean
  // optional enhancements for a real dashboard:
  title?: string
  kind?: MessageKind
  href?: string
  createdAt?: string // <-- OPTIONAL for now
  objectLabel?: string
  severity?: "info" | "success" | "warning"
}

const KIND_META: Record<
  MessageKind,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  application: { label: "Ansökningar", Icon: Building2 },
  platform: { label: "Plattform", Icon: Bell },
  insight: { label: "Insikter", Icon: TrendingUp },
}

function inferKindFromText(text: string): MessageKind {
  const t = (text ?? "").toLowerCase()
  if (t.includes("ansök") || t.includes("application")) return "application"
  if (t.includes("trend") || t.includes("insikt") || t.includes("statistik"))
    return "insight"
  return "platform"
}

function severityDot(sev?: Message["severity"]) {
  switch (sev) {
    case "warning":
      return "bg-amber-500"
    case "success":
      return "bg-emerald-500"
    default:
      return "bg-blue-500"
  }
}

function parseDateSafe(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date && !isNaN(value.getTime())) return value

  if (typeof value === "number") {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }

  if (typeof value === "string") {
    // common backend format: "YYYY-MM-DD HH:mm:ss"
    const normalized = value.includes(" ") ? value.replace(" ", "T") : value
    const d = new Date(normalized)
    return isNaN(d.getTime()) ? null : d
  }

  return null
}

// "Idag / Igår / X dagar sedan" up to maxDays, else YYYY-MM-DD.
// If date is missing -> "Nyss"
function relativeSwedishDate(date: Date | null, maxDays = 7) {
  if (!date) return "Nyss"

  const now = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.floor((startOfToday.getTime() - startOfDate.getTime()) / msPerDay)

  if (diffDays === 0) return "Idag"
  if (diffDays === 1) return "Igår"
  if (diffDays > 1 && diffDays <= maxDays) return `${diffDays} dagar sedan`

  return date.toISOString().slice(0, 10)
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs",
        active ? "bg-accent" : "bg-background hover:bg-accent/50"
      )}
    >
      {children}
    </button>
  )
}

type Props = {
  messages: Message[]
  onMarkAllRead?: () => Promise<void> | void
  onMarkRead?: (id: string) => Promise<void> | void
}

export function MessageWidget({ messages, onMarkAllRead, onMarkRead }: Props) {
  const [open, setOpen] = React.useState(false)
  const [tab, setTab] = React.useState<"all" | MessageKind>("all")

  const unreadCount = React.useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages]
  )

  const enriched = React.useMemo(() => {
    return messages.map((m) => {
      const kind = m.kind ?? inferKindFromText(m.title ?? m.text)
      const date = parseDateSafe(m.createdAt)
      return { ...m, kind, _date: date }
    })
  }, [messages])

  const filtered = React.useMemo(() => {
    const base = tab === "all" ? enriched : enriched.filter((m) => m.kind === tab)

    // newest first, BUT: createdAt is currently often missing.
    // We sort real dates first; undated ones keep their relative order after dated ones.
    return [...base].sort((a, b) => {
      const ta = a._date?.getTime()
      const tb = b._date?.getTime()
      if (ta == null && tb == null) return 0
      if (ta == null) return 1
      if (tb == null) return -1
      return tb - ta
    })
  }, [enriched, tab])

  const handleMarkAll = async () => {
    await onMarkAllRead?.()
  }

  const handleClickItem = async (m: (typeof enriched)[number]) => {
    if (!m.read) await onMarkRead?.(m.id)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -bottom-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-3">
          <div>
            <DropdownMenuLabel className="p-0">Meddelanden</DropdownMenuLabel>
            <div className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} olästa` : "Inga olästa"}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || !onMarkAllRead}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Markera alla
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-3 pb-2">
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            Alla
          </TabButton>
          <TabButton active={tab === "application"} onClick={() => setTab("application")}>
            Ansökningar
          </TabButton>
          <TabButton active={tab === "platform"} onClick={() => setTab("platform")}>
            Plattform
          </TabButton>
          <TabButton active={tab === "insight"} onClick={() => setTab("insight")}>
            Insikter
          </TabButton>
        </div>

        <DropdownMenuSeparator />

        {/* List */}
        <div className="max-h-[420px] overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium">Inga meddelanden</div>
              <div className="text-xs text-muted-foreground">
                Här dyker ansökningar, uppdateringar och insikter upp.
              </div>
            </div>
          ) : (
            filtered.map((m) => {
              const meta = KIND_META[m.kind] ?? KIND_META.platform
              const { Icon, label } = meta
              const timeLabel = relativeSwedishDate(m._date)

              const title = m.title ?? (m.kind === "application" ? "Ny händelse" : "Uppdatering")
              const description = m.text
              const href = m.href

              const Wrapper: any = href ? Link : "button"
              const wrapperProps = href
                ? { href, onClick: () => handleClickItem(m) }
                : { type: "button" as const, onClick: () => handleClickItem(m) }

              return (
                <Wrapper
                  key={m.id}
                  {...wrapperProps}
                  className={cn(
                    "flex w-full gap-3 px-3 py-3 text-left transition hover:bg-accent",
                    !m.read && "bg-accent/40"
                  )}
                >
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border bg-background">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm", !m.read && "font-semibold")}>
                            {title}
                          </span>
                          <span
                            className={cn("h-2 w-2 rounded-full", severityDot(m.severity))}
                            aria-hidden="true"
                          />
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                          <span>{label}</span>
                          <span>•</span>
                          <span>{timeLabel}</span>
                          {m.objectLabel ? (
                            <>
                              <span>•</span>
                              <span className="truncate">{m.objectLabel}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {href ? (
                        <ExternalLink className="mt-1 h-4 w-4 text-muted-foreground" />
                      ) : null}
                    </div>

                    {description ? (
                      <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {description}
                      </div>
                    ) : null}

                    {!m.read ? <div className="mt-2 text-xs font-medium">Oläst</div> : null}
                  </div>
                </Wrapper>
              )
            })
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Footer */}
        <div className="flex items-center justify-between p-3">
          <Link href="/portal/meddelanden" className="text-sm underline underline-offset-4">
            Visa alla
          </Link>
          <Link href="/portal/ansokningar" className="text-sm underline underline-offset-4">
            Ansökningar
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

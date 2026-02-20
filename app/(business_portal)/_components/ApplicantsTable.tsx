"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type ExpandedState,
} from "@tanstack/react-table"
import { Archive, CheckCircle, ChevronDown, Clock, House, Search, SquareArrowOutUpRight, Star, X } from "lucide-react"
import { cn, relativeSwedishDate } from "@/lib/utils"
import { useEffect, useState } from "react"
import { ButtonGroup } from "@heroui/button"
import ConfirmButton from "./ConfirmButton"
import Link from "next/link"
import Image from "next/image"
import { TooltipButton } from "../../../components/Dashboard/TooltipButton"
import { Applicant, ApplicantsTableProps, Application } from "@/lib/definitions"

const statusVals = {
  accepted: {text: "Accepterad", icon: <CheckCircle className="inline h-4 w-4 text-green-500 mb-0.5"/>},
  pending: {text: "Väntande", icon: <Clock className="inline h-4 w-4 text-yellow-500 mb-0.5"/>},
  reviewed: {text: "Granskad", icon: <Search className="inline h-4 w-4 text-blue-500 mb-0.5"/>},
  rejected: {text: "Avvisad", icon: <X className="inline h-4 w-4 text-red-500 mb-0.5"/>},
}

const statusWithIcon = (status: string | undefined) => {
  console.log("Status:", status);
    if (status && status in statusVals) {
      return <div className="flex gap-2 items-center">
        {statusVals[status as keyof typeof statusVals].icon}
        <p className="capitalize">{statusVals[status as keyof typeof statusVals].text}</p>
      </div>
    }
}

const getStatusTranslation = (status: string | undefined) => {
    if (status && status in statusVals) {
      return statusVals[status as keyof typeof statusVals].text;
    }
}

export const columns: ColumnDef<ApplicantsTableProps>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "applicantName",
    header: "Namn",
    cell: ({ row }) => <div className="font-medium">{row.getValue("applicantName")}</div>,   
  },
  {
    accessorKey: "object",
    header: "Objekt",
    cell: ({ row }) => <div className={cn("flex gap-1", row.getValue("object") == "Bostadskö" && "font-medium")}>
      {row.getValue("object") == "Bostadskö" && <House size={14} />}
      {row.getValue("object")}
      </div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      statusWithIcon(row.getValue("status"))
    ),
  },
  {
    accessorKey: "appliedAt",
    header: "Ansökningsdatum",
    sortingFn: "datetime",
    accessorFn: (row) => new Date(row.appliedAt),
    cell: ({ row }) => {
        const date = new Date(row.getValue("appliedAt"))
        return (
            <span className="tabular-nums">
              {relativeSwedishDate(date, { maxDays: 7, fallbackFormat: "yyyy-MM-dd" })}
            </span>
        )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
        return (
            <Link href={`/portal/ansokningar/${row.original.id}`} className="cursor-pointer">
                <SquareArrowOutUpRight className="h-4 w-4" />
            </Link>
        )
    }
  }
]


function updateApplicationStatus(applicationIds: string[], status: string) {
    // Här skulle du normalt göra en API-anrop för att uppdatera statusen i backend
    console.log(`Uppdaterar applikationer ${applicationIds.join(", ")} till status: ${status}`);
}



type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
  applicantsTableProps: Promise<ApplicantsTableProps[]>
}

export default function ApplicantsTable({
    className,
    applicantsTableProps,
    ...props
}: Props) {

  const [data, setData] = React.useState<ApplicantsTableProps[]>([]);

  React.useEffect(() => {
    applicantsTableProps.then(setData);
  }, [applicantsTableProps]);


  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "appliedAt", desc: true },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true, // allow all rows to expand
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
  })

    const [open, setOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<
    "pending" | "reviewed" | "accepted" | "rejected" | null
    >(null)
    const [filterQueue, setFilterQueue] = useState(false)

    useEffect(() => {
      table.getColumn("object")?.setFilterValue(filterQueue ? "Bostadskö" : undefined)
    }, [filterQueue, table])


  return (
    <div className={cn(className, "w-full")} {...props}>
      <div className="flex items-center py-4 gap-3">
        <Input
          placeholder="Sök ansökningar..."
          value={(table.getColumn("applicantName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("applicantName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <TooltipButton
          variant={filterQueue ? "default" : "outline"}
          tooltip={
            filterQueue ? 
            "Sluta filtrera efter bostadskö." :
            "Visa endast ansökningarna till bostadskö."
          }
          leftIcon={<House className="h-4 w-4" />}
          onClick={() => setFilterQueue(val => !val)}
        >
          {
            filterQueue ? "Filtrerar bostadskö" : "Filtrera bostadskö"
          }
        </TooltipButton>
        {/* Ändra status */}
        {
            table.getFilteredSelectedRowModel().rows.length > 0 && (
                <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="">
                        Ändra status <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                        {(["pending", "reviewed", "accepted", "rejected"] as const).map((status) => 
                        (
                            <DropdownMenuItem
                                key={status}
                                className="cursor-pointer"
                                onSelect={(e) => {
                                    e.preventDefault()
                                    setSelectedStatus(status)
                                    setOpen(true)
                                }}
                            >
                                {getStatusTranslation(status)}
                            </DropdownMenuItem>
                        ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Är du säker?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Du håller på att ändra {table.getFilteredSelectedRowModel().rows.length} objekt{table.getFilteredSelectedRowModel().rows.length === 1 ? "" : "s"} status till{" "}
                            <b>{selectedStatus ? getStatusTranslation(selectedStatus) : ""}</b>.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (!selectedStatus) return
                            updateApplicationStatus(
                                table.getFilteredSelectedRowModel().rows.map(row => row.original.id),
                                selectedStatus
                            )
                            setOpen(false)
                        }}>
                            Fortsätt
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </>
            )
        }
        {/* Arkivera */}
        {
            table.getFilteredSelectedRowModel().rows.length > 0 && (
                <ButtonGroup>
                    <ConfirmButton 
                        actionLabel="arkivera"
                        selectedItems={table.getFilteredSelectedRowModel().rows.length}
                        tooltipText="Arkivera"
                        onConfirm={async () => {
                            console.log("Arkiverar ansökningar")
                        }}
                        variant={"outline"}
                    >
                        <Archive className="h-4 w-4" />
                    </ConfirmButton>
                    
                </ButtonGroup>
            )
        }
        
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    row.toggleExpanded()
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={row.getVisibleCells().length} className="bg-muted/30">
                      <div className="p-3 flex gap-2">
                        <Image 
                          src={"/appartment.jpg"}
                          alt="Image of the apartment"
                          width={148}
                          height={148}
                          className="rounded-md object-cover"
                        />
                        <div className="">
                          <div>
                            
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2">
                          <Image 
                            src={"/logo.png"} 
                            alt="Profile picture" 
                            width={48}
                            height={48}
                          />
                          <div>
                            <div className="mt-2 font-medium">{row.original.applicantName}</div>
                            <div className="text-sm text-muted-foreground">{row.original.applicantEmail}</div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Inga resultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} av{" "}
          {table.getFilteredRowModel().rows.length} föremål valda.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Föregående
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Nästa
          </Button>
        </div>
      </div>
    </div>
  )
}
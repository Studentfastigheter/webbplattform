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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Archive, ArrowUpDown, ChevronDown, MoreHorizontal, SquareArrowOutUpRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ButtonGroup } from "@heroui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import ConfirmButton from "./ConfirmButton"
import Link from "next/link"

const getStatusTranslation = (status: string | undefined) => {
    const vals = {
        pending: "Väntande",
        reviewed: "Granskad",
        accepted: "Accepterad",
        rejected: "Avvisad",
    }

    if (status && status in vals) {
        return vals[status as keyof typeof vals];
    }
}

const data: Application[] = [
  {
    id: "m5gr84i9",
    name: "Bengt Svensson",
    object: "Chalmers tvärgata lgh 1001",
    status: "accepted",
    email: "ken99@example.com",
  },

    {
    id: "xj4lm9z2",
    name: "Anna Karlsson",
    object: "Chalmers tvärgata lgh 1002",
    status: "pending",
    email: "anna.karlsson@example.com",
  },
    {
    id: "a8n3k2p0",
    name: "Johan Eriksson",
    object: "Chalmers tvärgata lgh 1003",
    status: "reviewed",
    email: "johan.eriksson@example.com",
  },


]

export type Application = {
  id: string
  name: string
  email: string
  object: string
  status: "pending" | "reviewed" | "accepted" | "rejected"
  applicationDateTime?: string
}

export const columns: ColumnDef<Application>[] = [
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
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Namn",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,   
  },
  {
    accessorKey: "object",
    header: "Objekt",
    cell: ({ row }) => <div>{row.getValue("object")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{getStatusTranslation(row.getValue("status"))}</div>
    ),
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
}

export default function ApplicantsTable({
    className,
    ...props
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

    const [open, setOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<
    "pending" | "reviewed" | "accepted" | "rejected" | null
    >(null)

  return (
    <div className={cn(className, "w-full")} {...props}>
      <div className="flex items-center py-4 gap-3">
        <Input
          placeholder="Sök ansökningar..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                        tooltipText="Arkivera markerade"
                        onConfirm={async () => {
                            console.log("Arkiverar applikationer")
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
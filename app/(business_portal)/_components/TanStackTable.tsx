"use client";

import { createAds, Ad } from "@/lib/data";
import {
  Column,
  createColumnHelper,
  getSortedRowModel,
  RowData,
  SortingState,
} from "@tanstack/react-table";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { DefaultCell } from "./table/defaultCell";
import DefaultHeader from "./table/defaultHeader";
import HeaderButton from "./table/headerButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MoreVertical, Rows2, Rows3, Rows4 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { setCookie, getCookie } from "cookies-next";

const rowDensityValues = {
  "dense": 35,
  "normal": 48,
  "spaced": 64,
}

const columnHelper = createColumnHelper<Ad>();

const columns = [
  columnHelper.display({
    id: "action",
    header: ({ table }) => (
      <div className="h-full flex items-center cursor-pointer">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="h-full flex items-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
  }),
  columnHelper.accessor("id", {
    header: (info) => <HeaderButton info={info} name="ID" />,
    cell: (info) => info.getValue(),
    minSize: 40,
  }),
  columnHelper.accessor("address", {
    header: (info) => <HeaderButton info={info} name="Adress" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("rooms", {
    header: (info) => <HeaderButton info={info} name="Antal rum" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("rent", {
    header: (info) => <HeaderButton info={info} name="Hyra" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: (info) => <HeaderButton info={info} name="Status" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: "more",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className=""
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuLabel className="">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="">Copy</DropdownMenuItem>
            <DropdownMenuItem>Paste</DropdownMenuItem>
            <DropdownMenuItem>Cut</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
  }),
];


export function DataTable() {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [rowData] = useState(() => [...createAds(100)]);

  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(c => c.id || ""));
  const [movingColumnId, setMovingColumnId] = useState<string | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  
  const [rowDensity, setRowDensity] = useState<"dense" | "normal" | "spaced" | null>();

  useEffect(() => {
    const saved = getCookie("rowDensity");

    if (saved === "dense" || saved === "normal" || saved === "spaced") {
      setRowDensity(saved);
    }
  }, []);

  useEffect(() => {
    rowVirtualizer.measure();

    setCookie("rowDensity", rowDensity, {
      maxAge: 60 * 60 * 24 * 365,  // 1 year
      path: "/",
    });
  }, [rowDensity]);

  const table = useReactTable<Ad>({
    data: rowData,
    columns,
    columnResizeMode: "onChange",
    columnResizeDirection: "ltr",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    enableColumnResizing: true,
    state: {
      rowSelection,
      sorting,
      columnOrder,
    },
  });

  const reorderColumn = (
    movingColumnId: string,
    targetColumnId: string,
  ): string[] => {
    const newColumnOrder = [...columnOrder];

    newColumnOrder.splice(
      newColumnOrder.indexOf(targetColumnId),
      0,
      newColumnOrder.splice(newColumnOrder.indexOf(movingColumnId), 1)[0],
    );
    return newColumnOrder; // Return the new column order
  };

  const handleDragEnd = (e: DragEvent) => {
    e.preventDefault(); // Prevent default behavior
    if (!movingColumnId || !targetColumnId) return;
    const newOrder = reorderColumn(movingColumnId, targetColumnId);
    setColumnOrder(newOrder);
  };

  const totalTableWidth = useMemo(() => {
    return table.getTotalSize();
  }, [table.getState().columnSizing]);

  // Setup virtualization for rows
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowDensityValues[rowDensity || "normal"], // estimate row height
    overscan: 10,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  // Shared table props to ensure consistent rendering
  const tableProps = {
    style: {
      tableLayout: "fixed" as const,
    },
  };

  return (
    <>
      <div className="flex mb-4">
        {/* <FilterButton options={[
          { value: "alla", label: "Alla städer" },
          { value: "stockholm", label: "Stockholm" },
          { value: "goteborg", label: "Göteborg" },
          { value: "malmo", label: "Malmö" },
        ]} /> */}


        <ul className="flex gap-1">
          <li className="cursor-pointer" onClick={() => setRowDensity("spaced")}><Rows2 size={16} className={`${rowDensity === "spaced" ? "text-green-600" : "text-neutral-700"}`} /></li>
          <li className="cursor-pointer" onClick={() => setRowDensity("normal")}><Rows3 size={16} className={`${rowDensity === "normal" ? "text-green-600" : "text-neutral-700"}`} /></li>
          <li className="cursor-pointer" onClick={() => setRowDensity("dense")}><Rows4 size={16} className={`${rowDensity === "dense" ? "text-green-600" : "text-neutral-700"}`} /></li>
        </ul>
      </div>
      <div
        style={{
          overflow: "auto",
          maxWidth: "100%"
        }}
        ref={outerContainerRef}
      >
        <div style={{ 
          width: Math.max(totalTableWidth + 10, 100) + "px", 
          minWidth: "100%" // Required for line propogation
        }}>
          {/* Header Table */}
          <div className="overflow-hidden">
            <Table {...tableProps}>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="flex w-full !bg-white">
                    {headerGroup.headers.map((header) => (
                      <DefaultHeader 
                        key={header.column.id} 
                        header={header} 
                      />
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            </Table>
          </div>

          {/* Body Table - only vertical scrolling */}
          <div
            ref={tableContainerRef}
            style={{
              height: `400px`,
              overflowY: "auto",
              overflowX: "hidden", // Prevent horizontal scrolling in the body
            }}
            onWheel={(e) => {
              // If this is a horizontal scroll attempt, let the parent handle it
              if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.stopPropagation();
                if (outerContainerRef.current) {
                  outerContainerRef.current.scrollLeft += e.deltaX;
                }
              }
            }}
          >
            <Table {...tableProps}>
              <TableBody
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualRows.map((virtualItem) => {
                  const row = rows[virtualItem.index];
                  return (
                    <TableRow
                      key={virtualItem.key}
                      className="absolute top-0 left-0 flex w-full items-center"
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <DefaultCell key={cell.id} cell={cell} />
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} rows slected
      </div>
    </>
  );
}
import { Cell, flexRender } from "@tanstack/react-table";
import { TableCell } from "@/components/ui/table";
import { twMerge } from "tailwind-merge";

export function DefaultCell<TData>({ cell }: { cell: Cell<TData, unknown> }) {
  const id = cell.column.id;



  return (
    <TableCell
      key={cell.id}
      style={{
        width: cell.column.getSize(),
        flex: `0 0 ${cell.column.getSize()}px`,
      }}
    >
      {
        id == "status" ? 
        <span className={twMerge(cell.getValue() == "ledig" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", "whitespace-nowrap overflow-hidden text-ellipsis max-w-full inline px-2 py-1 rounded-full text-sm font-medium capitalize")}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </span> : 
        <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full block">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </span>
      }
      
    </TableCell>
  );
}
import { Cell, flexRender } from "@tanstack/react-table";
import { TableCell } from "@/components/ui/table";
import PortalListingStatusTag, {
  type PortalListingStatusTone,
} from "../PortalListingStatusTag";

function getListingStatusTone(status: unknown): PortalListingStatusTone {
  return String(status).toLowerCase() === "ledig" ? "success" : "neutral";
}

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
        <PortalListingStatusTag
          label={flexRender(cell.column.columnDef.cell, cell.getContext())}
          tone={getListingStatusTone(cell.getValue())}
          className="max-w-full overflow-hidden text-ellipsis capitalize"
        /> :
        <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full block">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </span>
      }
      
    </TableCell>
  );
}

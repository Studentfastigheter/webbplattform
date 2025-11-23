import { cn } from "@/lib/utils";
import { flexRender, Header } from "@tanstack/react-table";
import { TableHead } from "@/components/ui/table";

export function DefaultHeader<TData>({
  header,
}: {
  header: Header<TData, unknown>;
}) {
  const resizeHandler = header.getResizeHandler();
  const isResizable = header.column.getCanResize()

  return (
    <TableHead
      key={header.column.id}
      colSpan={header.colSpan}
      className={cn("relative font-semibold text-left p-2 bg-background")}
      style={{
        width: header.column.getSize(),
        flex: `0 0 ${header.column.getSize()}px`,
      }}
    >
      <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
        {flexRender(header.column.columnDef.header, header.getContext())}
      </span>

      {
        isResizable ? 
          <div
            onDoubleClick={() => header.column.resetSize()}
            onMouseDown={resizeHandler}
            onTouchStart={resizeHandler}
            className={`absolute right-[-16px] top-0 h-full select-none px-4 group z-10`}
            style={{ cursor: "col-resize", touchAction: "none" }}
          >
            <div className={`w-[5px] h-full group-hover:bg-primary/20 transition-colors duration-200 ${
              header.column.getIsResizing() ? "bg-secondary" : ""
            }`} />
          </div> : <></>
      }
    </TableHead>
  );
}

export default DefaultHeader;
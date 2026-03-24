import { type TableAd } from "@/lib/data";
import { HeaderContext } from "@tanstack/react-table";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

interface HeaderButtonProps<T> {
  info: HeaderContext<TableAd, T>;
  name: string;
}

export function HeaderButton<TValue>({
  info,
  name,
}: HeaderButtonProps<TValue>) {
  const { table, header } = info;
  const sorted = info.column.getIsSorted();

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onPointerDown={(e: any) => {
          e.preventDefault();
          info.column.toggleSorting(info.column.getIsSorted() === "asc");
        }}
        className="w-full h-full flex flex-row items-center justify-start gap-1 cursor-default pr-5"
      >
        <span className="flex flex-row items-center gap-1 shrink-0">
          {!sorted && <ChevronsUpDown className="shrink-0" size={12} />}
          {sorted === "asc" && <ChevronDown size={12} />}
          {sorted === "desc" && <ChevronUp size={12} />}
        </span>
        {name}
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e: any) => e.preventDefault()}
        onContextMenu={(e: any) => e.preventDefault()}
      >
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <ContextMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value: any) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </ContextMenuCheckboxItem>
          ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default HeaderButton;

"use client";
import { CirclePlus, CopyPlus, Plus } from "lucide-react";
import Container from "./Container";

import { Button } from "@/components/ui/button"
import { ORGANISATION_DASHBOARD_STATISTICS } from "@/lib/data";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react";


export default function AddStatistic({
  columnSpan,
}: {
  columnSpan: number;
}) {
  
  return (
    <DropdownMenu>
        <DropdownMenuTrigger>
          <Container onClick={() => {}} columnSpan={columnSpan} padding="sm" borderStyle="dashed" className="hover:!border-solid hover:!shadow-xs transition-all duration-75">
            <CopyPlus size={24} className="text-neutral-400 mb-2 mx-auto" />
            <p className="text-sm text-brand font-bold text-center tracking-wide">Add data</p>
          </Container>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Visa data</DropdownMenuLabel>
          <DropdownMenuGroup>
            {
              ORGANISATION_DASHBOARD_STATISTICS.map((item) =>
                {
                  const [hover, setHover] = useState(false)
                  
                  
                  return <DropdownMenuItem key={item.id} className="cursor-pointer" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                    <item.icon size={14} className="text-neutral-400" />
                    {item.label}
                    {
                      hover ?
                      <CirclePlus className="ml-auto" />
                      :
                      <Plus className="ml-auto" />
                    }
                  </DropdownMenuItem>
                }
              )
            }
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    
  )
}
"use client";
import { CirclePlus, CopyPlus, Plus } from "lucide-react";
import Container from "./Container";

import { Button } from "@/components/ui/button"
import { ORGANISATION_DASHBOARD_STATISTICS } from "@/lib/data";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



type AddStatisticProps =  React.ComponentProps<typeof DropdownMenuPrimitive.Root> & {
  shownStatistics?: string[];
};

export default function AddStatistic({
  shownStatistics,
  ...props
}: AddStatisticProps) {
  
  return (
    <DropdownMenu {...props}>
        <DropdownMenuTrigger>
          <Container onClick={() => {}} padding="sm" borderStyle="dashed" className="hover:!border-solid hover:!shadow-xs transition-all duration-75">
            <CopyPlus size={24} className="text-neutral-400 mb-2 mx-auto" />
            <p className="text-xs text-brand font-bold text-center tracking-wide">Bifoga data</p>
          </Container>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Visa data</DropdownMenuLabel>
          <DropdownMenuGroup>
            {
              ORGANISATION_DASHBOARD_STATISTICS.map((item) =>
                {
                  if (!(shownStatistics && shownStatistics.includes(item.id))) {
                    return null;
                  }
                  return <DropdownMenuItem key={item.id} className="cursor-pointer font-medium text-neutral-500 group-hover:text-black group">
                    <item.icon size={14} className="text-neutral-400 group-hover:text-black" />
                    {item.label}
                    <Plus className="ml-auto" />
                  </DropdownMenuItem>
                }
              )
            }
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    
  )
}
"use client"

import React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
  heading,
  activeUrl,
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup> & {
  items: {
    title: string
    url: string
    icon?: React.ComponentType<any>
  }[],
  activeUrl: string | null,
  heading: string | null,
}) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent className="flex flex-col gap-2">
        {heading && <SidebarGroupLabel>{heading}</SidebarGroupLabel>}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

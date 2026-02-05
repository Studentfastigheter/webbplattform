"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
} from "lucide-react"

import { NavMain } from "./NavMain"
import { NavUser } from "./NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import Image from "next/image"
import CampusLyanLogo from "@/public/campuslyan-logo.svg"
import { dashboardRelPath } from "../../_statics/variables"
import Link from "next/link"
import { lowestCommonRoute, normalizeRoute } from "@/lib/utils"
import { usePathname } from "next/navigation"

const data = {
  user: {
    name: "SGS",
    email: "test@sgs.se",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: {
    heading: null,
    items: [
      {
        title: "Dashboard",
        url: `${dashboardRelPath}`,
        icon: LayoutDashboard,
      },
      {
        title: "Annonser",
        url: `${dashboardRelPath}/annonser`,
        icon: FileText,
      },
      {
        title: "Ansökningar",
        url: `${dashboardRelPath}/ansokningar`,
        icon: Users,
      },
  ],},
  navSecondary: {
    heading: null,
    items: [
    {
      title: "Inställningar",
      url: `${dashboardRelPath}/installningar`,
      icon: Settings,
    },
  ],},
  documents: {
    heading: "Övrigt",
    items: [
      {
        title: "Bilagor",
        url: `${dashboardRelPath}/bilagor`,
        icon: FileText,
      },
    ]},
}

function getAllUrls(obj: any): string[] {
  const urls: string[] = [];

  const walk = (node: any) => {
    if (!node) return;

    if (Array.isArray(node)) {
      for (const x of node) walk(x);
      return;
    }

    if (typeof node === "object") {
      if (typeof node.url === "string") urls.push(node.url);

      for (const key of Object.keys(node)) {
        walk(node[key]);
      }
    }
  };

  walk(obj);

  // dedupe + normalize
  return Array.from(new Set(urls.map(normalizeRoute)));
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Combine all navigation items to determine single active link
  const allItems = [
    ...data.navMain.items,
    ...data.documents.items,
    ...data.navSecondary.items,
  ]

  const pathname = usePathname();

  const urls = getAllUrls(allItems)
  const activeUrl = lowestCommonRoute(urls, pathname)



  return (
    <Sidebar collapsible="icon"  {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 bg-transparent hover:bg-transparent"
            >
              <Link href={dashboardRelPath}>
                <Image src={CampusLyanLogo} width={20} height={29} alt="CampusLyan" />
                <span className="text-base font-semibold">CampusLyan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain 
          heading={data.navMain.heading}
          items={data.navMain.items}
          activeUrl={activeUrl}
        />
        <NavMain 
          heading={data.documents.heading}
          items={data.documents.items}
          activeUrl={activeUrl}
        />
        <NavMain 
          heading={data.navSecondary.heading}
          items={data.navSecondary.items}
          activeUrl={activeUrl}
          className="mt-auto" 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

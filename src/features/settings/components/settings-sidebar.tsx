"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/animate-ui/components/radix/sidebar";
import { Bell, Lock, Shield, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsKey = "personal" | "security" | "privacy" | "notifications";

const ITEMS: Array<{
  key: SettingsKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "personal", label: "Personuppgifter", icon: UserRound },
  { key: "security", label: "Inloggning & säkerhet", icon: Lock },
  { key: "privacy", label: "Sekretess", icon: Shield },
  { key: "notifications", label: "Påminnelser", icon: Bell },
];

export function SettingsSidebar({
  active,
  onChange,
}: {
  active: SettingsKey;
  onChange: (key: SettingsKey) => void;
}) {
  return (
    <Sidebar
      collapsible="none"
      animateOnHover={false}
      className="h-full w-[280px] max-w-[320px] shrink-0 bg-transparent px-2"
    >
      <SidebarHeader className="px-4 pt-2 pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Inställningar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hantera konto och preferenser
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs text-muted-foreground">
            Inställningar
          </SidebarGroupLabel>
          <SidebarMenu>
            {ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;

              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    onClick={() => onChange(item.key)}
                    tooltip={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-md",
                      "bg-transparent text-foreground",
                      "hover:bg-muted/60",
                      isActive && "bg-muted hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Rail kan du behålla, men om du vill vara super-minimal: ta bort den */}
      <SidebarRail />
    </Sidebar>
  );
}

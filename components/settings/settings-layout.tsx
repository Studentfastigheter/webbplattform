"use client";

import * as React from "react";
import { SettingsSidebar, type SettingsKey } from "./settings-sidebar";
import { SettingsContent } from "./settings-content";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/animate-ui/components/radix/sidebar";

export function SettingsLayout() {
  const [active, setActive] = React.useState<SettingsKey>("personal");

  return (
    <div className="h-full w-full ">
      <SidebarProvider className="h-full w-full">
        {/* Full bredd + rundade kanter + border */}
        <div className="flex h-full w-full overflow-hidden">
          <SettingsSidebar active={active} onChange={setActive} />

          {/* Viktigt: flex-1 + min-w-0 så content kan växa och scrolla korrekt */}
          <SidebarInset className="min-w-0 flex-1 h-full">
            <div className="h-full w-full overflow-auto py-6">
              <div className="w-full">
                <SettingsContent active={active} />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

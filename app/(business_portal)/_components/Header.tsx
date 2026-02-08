"use client";

import { TooltipButton } from "@/components/Dashboard/TooltipButton";
// import { ArrowLeft, ChevronDown, Settings } from "lucide-react";
// import Link from "next/link";
// import { MessageWidget } from "./MessageWidget";

// const messages = [
//   { id: "1", text: "Hello!", read: false },
//   { id: "2", text: "How are you?", read: true },
//   { id: "3", text: "Don't forget our meeting.", read: false },
// ]

// function SettingsWidget() {

//   return (
//     <Link href={"/portal/installningar"}>
//       <Settings width={20} height={20} />
//     </Link>
//   )
// }



// function Profile() {

//   return (
//     <div className="flex gap-2 justify-center items-center">
//       <Link href={"/portal/profil"} className="flex gap-3 text-sm font-medium items-center">
//         <p>SGS</p>
//         <div className="h-8 w-8 bg-amber-700 relative rounded-full" />
//       </Link>
//     </div>
//   )
// }

// export function Header() {
//   return (
//     <header
//       className="flex h-16 items-center sticky top-0 right-0 left-56 z-40 justify-between border-b border-slate-100 shadow-xs bg-white px-4 md:px-6"
//       role="banner"
//     >
//       <Link href={"/"} className="flex gap-2 text-sm">
//         <ArrowLeft size={14} />
//         Back to CampusLyan
//       </Link>



//       <nav className="flex gap-4 items-center">
//         <ul className="list-none flex gap-4 items-center">
//           <li><MessageWidget messages={messages} /></li>
//           <li><SettingsWidget /></li>
          
//         </ul>

//         <div role="none" className="w-px h-7 bg-black opacity-5" />
        
//         <Profile />
//       </nav>
//     </header>
//   );
// }

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Toggles from "./Toggles";

export function Header() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <TooltipButton 
          tooltipTitle="Stäng sidomenyn"
          unstyled
          shortcuts={[{ keys: ["Ctrl", "b"], label: "Snabbkommando" }]}
        >
          <SidebarTrigger className="-ml-1" />
        </TooltipButton>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Link href="/" className="text-sm flex items-center gap-1 group relative text-neutral-600 hover:text-black">
          <p>Till CampusLyan</p>
          <ArrowRight size={14} className="relative group-hover:translate-x-1 transition-all duration-150" />
        </Link>
        <div className="ml-auto">
          <Toggles 
            options={[
              { value: "1w", ariaLabel: "1 vecka", label: "1 vecka" },
              { value: "1m", ariaLabel: "1 månad", label: "1 mån" },
              { value: "3m", ariaLabel: "3 månader", label: "3 mån" },
              { value: "12m", ariaLabel: "12 månader", label: "12 mån" },
            ]}
            defaultValue="1w"
          />
        </div>
      </div>
    </header>
  )
}

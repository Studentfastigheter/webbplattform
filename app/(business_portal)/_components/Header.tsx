"use client";

import { ArrowLeft, ChevronDown, Settings } from "lucide-react";
import Link from "next/link";
import { MessageWidget } from "./MessageWidget";

const messages = [
  { id: "1", text: "Hello!", read: false },
  { id: "2", text: "How are you?", read: true },
  { id: "3", text: "Don't forget our meeting.", read: false },
]

function SettingsWidget() {

  return (
    <Link href={"/portal/installningar"}>
      <Settings width={20} height={20} />
    </Link>
  )
}



function Profile() {

  return (
    <div className="flex gap-2 justify-center items-center">
      <Link href={"/portal/profil"} className="flex gap-3 text-sm font-medium items-center">
        <p>SGS</p>
        <div className="h-8 w-8 bg-amber-700 relative rounded-full" />
      </Link>
    </div>
  )
}

export function Header() {
  return (
    <header
      className="flex h-16 items-center fixed top-0 right-0 left-56 z-40 justify-between border-b border-slate-100 shadow-xs bg-white px-4 md:px-6"
      role="banner"
    >
      <Link href={"/"} className="flex gap-2 text-sm">
        <ArrowLeft size={14} />
        Back to CampusLyan
      </Link>



      <nav className="flex gap-4 items-center">
        <ul className="list-none flex gap-4 items-center">
          <li><MessageWidget messages={messages} /></li>
          <li><SettingsWidget /></li>
          
        </ul>

        <div role="none" className="w-px h-7 bg-black opacity-5" />
        
        <Profile />
      </nav>
    </header>
  );
}

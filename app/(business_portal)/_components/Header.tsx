"use client";

import { ArrowLeft, ChevronDown, Divide, Settings } from "lucide-react";
import Link from "next/link";



function SettingsWidget() {

  return (
    <Link href={""}>
      <Settings />
    </Link>
  )
}

function Profile() {

  return (
    <div className="flex gap-2 justify-center items-center">
      <Link href={""} className="flex gap-3 text-sm font-medium">
        <p>Lucas</p>
        <ChevronDown size={14} />
      </Link>
      <Link href={""} className="h-8 w-8 bg-amber-700 relative rounded-full">

      </Link>
    </div>
  )
}

export function Header() {
  return (
    <header
      className="flex h-16 items-center justify-between border-b border-slate-100 shadow bg-white px-4 md:px-6"
      role="banner"
    >
      <Link href={"/"} className="flex gap-2 text-sm">
        <ArrowLeft size={14} />
        Back to CampusLyan
      </Link>



      <nav className="flex gap-4 items-center">
        <ul className="list-none">
          <li>
            <SettingsWidget />
          </li>

        </ul>

        <div role="none" className="w-px h-7 bg-black opacity-5" />
        
        <Profile />
      </nav>
    </header>
  );
}

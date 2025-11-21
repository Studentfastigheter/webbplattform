"use client";

import { ArrowLeft, ChevronDown, MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { Message } from "../_statics/types";

const messages = [
  { id: 1, text: "Hello!", read: false },
  { id: 2, text: "How are you?", read: true },
  { id: 3, text: "Don't forget our meeting.", read: false },
]

function SettingsWidget() {

  return (
    <Link href={""}>
      <Settings />
    </Link>
  )
}

function MessageWidget({ messages }: { messages: Message[] }) {

  return (
    <Link className="relative" href={""}>
      <MessageCircle />
      {messages.some(msg => !msg.read) && (
        <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full aspect-square">
          {messages.filter(msg => !msg.read).length}
        </span>
      )}
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

"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { Message } from "../_statics/types";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";



export function MessageWidget({ messages }: { messages: Message[] }) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative">
                    <MessageCircle width={20} height={20} />
                    {messages.some(msg => !msg.read) && (
                        <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full aspect-square">
                        {messages.filter(msg => !msg.read).length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                {messages.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">Inga meddelanden</p>
                ) : (messages.map(msg => (
                    <div 
                        key={msg.id}
                        className={`p-4 text-sm ${msg.read ? 'text-gray-500' : 'font-medium'}`}
                    >
                        {msg.text}
                    </div>
                )))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

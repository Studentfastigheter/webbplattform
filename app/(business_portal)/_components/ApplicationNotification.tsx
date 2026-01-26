"use client"

import Image from "next/image"
import Favorite from "./Favorite"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Check } from "lucide-react"
import { useState } from "react"
import Link from "next/link"


export type ApplicationNotificationProps = {
    name: string,
    age: number,
    address: string,
}


export default function ApplicationNotification({
    name,
    age,
    address,
}: ApplicationNotificationProps) {

    const [isRead, setIsRead] = useState(false);

    return (
        <Link href="#" className="flex relative gap-4 cursor-pointer">
            <div className="flex gap-4 py-4 hover:bg-neutral-100 px-3 rounded flex-1 relative">
                <Image src="/campuslyan-logo.svg" alt="Foto på ansökare" width={24} height={24} />
                <div className="">
                    <h4 className="text-sm font-medium">{address}</h4>
                    <p className="text-muted-foreground text-xs">{name} - {age} år</p>
                </div>
                
                {/* {!isRead && <div className="absolute top-1/2 -translate-4 left-6 bg-brand w-1 h-1 rounded-full" />} */}
            </div>

            {/* <div className="flex items-center">

                <Favorite />
                

                {!isRead && <Tooltip>
                    <TooltipTrigger asChild onClick={() => setIsRead(true)}>
                        <div className="p-2 cursor-pointer">
                            <Check width={16} height={16} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="pointer-events-none">
                        <p>Markera som läst</p>
                    </TooltipContent>
                </Tooltip>}
                
            </div> */}

            
            {/* <div className="absolute bg-brand w-1 h-1 rounded-full" /> */}
        </Link>
    )
}
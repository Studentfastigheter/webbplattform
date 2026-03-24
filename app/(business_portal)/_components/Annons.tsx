import ListingCard_Small from "@/components/Listings/ListingCard_Small";
import { cn } from "@/lib/utils";
import { Clock, Eye, FileUser } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { dashboardRelPath } from "../_statics/variables";

type AnnonsProps = {
    id: string;
    address: string;
    apartmentNumber: string;
    area: string;
    city: string;
    status: string;
    imageUrl: string;
    uploadedDatetime: string;
    data: AnnonsData;
}

type AnnonsData = {
    views: number;
    applications: number;
}


export function AnnonsPreview({
    id,
    address,
    apartmentNumber,
    area,
    city,
    status,
    imageUrl,
    uploadedDatetime,
    data,
}: AnnonsProps) {
  return (
    <Link href={`${dashboardRelPath}/annonser/${id}`} className="cursor-pointer hover:bg-neutral-50 rounded">
        <div className="relative">
            <Image 
                src={imageUrl} 
                alt=""
                width={300}
                height={200}
                className="brightness-75 aspect-video object-cover object-center rounded min-w-44"
            />
            {/* <p className={cn(status.toLowerCase() == "aktiv" ? "text-white" : "text-white", `text-center absolute top-1/2 left-1/2 -translate-1/2 opacity-80 px-2 py-1 rounded text-6xl font-semibold -rotate-20 uppercase`)}>{status}</p> */}
        </div>
        <div className="px-2 pb-4 mt-1.5">
            <p className="text-sm font-semibold">{address}</p>
            <div className="flex gap-2 items-center -mt-0.5">
                <p className="text-xs text-muted-foreground">Lgh {apartmentNumber}</p>
                {"\u00b7"}
                <p className="text-xs text-muted-foreground ">{area}, {city}</p>
            </div>
            
            <div className="mt-2 flex gap-6 text-neutral-600">
                <div className="flex gap-1">
                    <Eye width={14} height={14} />
                    <p className="text-xs">{data.views}</p>
                </div>
                <div className="flex gap-1">
                    <FileUser width={14} height={14} />
                    <p className="text-xs">{data.applications}</p>
                </div>
            </div>

            <div className="flex gap-2 items-center mt-1">
                <Clock width={14} height={14} /> 
                <p className="text-xs text-muted-foreground">{uploadedDatetime}</p>
            </div>
            {
                status.toLowerCase() == "aktiv" ? (
                    <div className="mt-3 bg-green-600/10 text-green-600 w-max px-2 py-0.5 rounded text-xs font-medium">
                        Aktiv
                    </div>
                ) : (
                    <div className="mt-3 bg-red-600/10 text-red-600 w-max px-2 py-0.5 rounded text-xs font-medium">
                        Inaktiv
                    </div>
                )
            }
        </div>
    </Link>
  )
}




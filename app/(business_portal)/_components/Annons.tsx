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
    <Link href={`${dashboardRelPath}/annonser/${id}`} className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-theme-xs transition hover:-translate-y-0.5 hover:shadow-theme-md">
        <div className="relative">
            <Image 
                src={imageUrl} 
                alt=""
                width={300}
                height={200}
                className="aspect-video w-full rounded-lg object-cover object-center brightness-90 transition group-hover:brightness-100"
            />
            {/* <p className={cn(status.toLowerCase() == "aktiv" ? "text-white" : "text-white", `text-center absolute top-1/2 left-1/2 -translate-1/2 opacity-80 px-2 py-1 rounded text-6xl font-semibold -rotate-20 uppercase`)}>{status}</p> */}
        </div>
        <div className="px-1 pb-1 pt-3">
            <p className="text-sm font-semibold text-gray-900">{address}</p>
            <div className="flex gap-2 items-center -mt-0.5">
                <p className="text-xs text-gray-500">Lgh {apartmentNumber}</p>
                {"\u00b7"}
                <p className="text-xs text-gray-500 ">{area}, {city}</p>
            </div>
            
            <div className="mt-3 flex gap-6 text-gray-600">
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
                <p className="text-xs text-gray-500">{uploadedDatetime}</p>
            </div>
            {
                status.toLowerCase() == "aktiv" ? (
                    <div className="mt-3 w-max rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">
                        Aktiv
                    </div>
                ) : (
                    <div className="mt-3 w-max rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-700">
                        Inaktiv
                    </div>
                )
            }
        </div>
    </Link>
  )
}




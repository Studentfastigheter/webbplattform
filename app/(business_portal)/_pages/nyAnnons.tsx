import { HousePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { dashboardRelPath } from "../_statics/variables";
import { ImageUploadField } from "@/components/Dashboard/Form";

export default function NyAnnons() {
  return (
    <div className="grid grid-cols-12">

      <ImageUploadField className="col-span-3" title="Släpp din CSV-fil här!" maxSize="5MB" supportedFileTypes={[".csv"]} />

      <div className="my-2 col-span-3 text-center flex items-center">
        <p className="text-sm mx-8">eller</p>
        <Link href={dashboardRelPath + "/annonser/ny/onboarding/1"}>
          <Button variant={"outline"} className="cursor-pointer">
            <HousePlus />
            Skapa annons
          </Button>
        </Link>
      </div>
    </div>
  )
}
import { HousePlus, Upload } from "lucide-react";
import Container from "../_components/Container";
import DragAndDrop from "../_components/DragAndDrop";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { dashboardRelPath } from "../_statics/variables";

export default function NyAnnons() {
  return (
    <div className="grid grid-cols-12">

      <DragAndDrop columnSpan={4} />

      <div className="my-2 col-span-3 text-center flex items-center">
        <p className="text-sm mx-8">eller</p>
        <Link href={dashboardRelPath + "/annonser/ny/onboarding"}>
          <Button variant={"outline"} className="cursor-pointer">
            <HousePlus />
            Skapa annons
          </Button>
        </Link>
      </div>
    </div>
  )
}
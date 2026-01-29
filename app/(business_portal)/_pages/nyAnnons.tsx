import { HousePlus, Upload } from "lucide-react";
import Container from "../_components/Container";
import DragAndDrop from "../_components/DragAndDrop";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { dashboardRelPath } from "../_statics/variables";

export default function NyAnnons() {
  return (
    <div className="grid grid-cols-12">

      <DragAndDrop className="col-span-3" title="Släpp din CSV-fil här!" description="Ladda upp flera objekt samtidigt." />

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
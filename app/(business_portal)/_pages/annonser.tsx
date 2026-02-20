import Search from "../_components/Search"
import { dashboardRelPath } from "../_statics/variables"
import NormalButton from "../_components/CTAButton"
import { AnnonsPreview } from "../_components/Annons"
import FilterButton from "../_components/FilterButton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TooltipButton } from "@/components/Dashboard/TooltipButton"
import { FolderDown, Plus } from "lucide-react"




export default function Annonser() {
  return (
    <>
      <div className="mb-4 m-2 flex items-center gap-3 justify-between">
        <Search />

        <div className="flex gap-2">

          <TooltipButton
            leftIcon={<Plus size={16} />}
            variant={"default"}
          >
            <Link href={`${dashboardRelPath}/annonser/ny/onboarding/1`}>
              Skapa annons
            </Link>
          </TooltipButton>

          <TooltipButton
            leftIcon={<FolderDown size={16} />}
            variant={"outline"}
          >
            <Link href={`${dashboardRelPath}/annonser/importera`}>
              Importera från CSV
            </Link>
          </TooltipButton>
        </div>

        {/* <Link href={`${dashboardRelPath}/annonser/ny`}>
          <Button variant="outline" size="sm">
            Importera annonser
          </Button>
        </Link>
        <Link href={`${dashboardRelPath}/annonser/ny`}>
          <Button variant="default" size="sm">
            Skapa annons
          </Button>
        </Link> */}
      </div>

      <div className="mb-8 m-2 flex gap-4">
        <FilterButton 
          options={[
            { label: "Alla städer", value: "all" }, 
            { label: "Göteborg", value: "goteborg" }, 
            { label: "Stockholm", value: "stockholm" },
            { label: "Malmö", value: "malmo" }
          ]} 
        />
        <FilterButton 
          options={[
            { label: "Senaste", value: "mostRecent" }, 
            { label: "Tidigaste", value: "leastRecent" }, 
            { label: "A-Ö", value: "aToZ" },
            { label: "Ö-A", value: "zToA" }
          ]} 
        />
        
      </div>

      <div className="m-2 grid gap-4 grid-cols-4">
        <AnnonsPreview 
          id="1"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="Igår kl. 14:23"
        />
        <AnnonsPreview 
          id="2"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="inaktiv"
          uploadedDatetime="12 dagar sedan"
        />
        <AnnonsPreview 
          id="3"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="30 dagar sedan"
        />
        <AnnonsPreview 
          id="4"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="12 månader sedan"
        />
        <AnnonsPreview 
          id="5"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="2 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />
        <AnnonsPreview 
          id="6"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="6 månader sedan"
        />


      </div>

      
    </>      
  )
}

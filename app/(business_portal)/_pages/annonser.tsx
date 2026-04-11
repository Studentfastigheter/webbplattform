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
    <div className="space-y-6">
      <div>
        <p className="text-theme-sm text-gray-500">Objekt</p>
        <h1 className="text-2xl font-semibold text-gray-900">Annonser</h1>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-theme-xs lg:flex-row lg:items-center lg:justify-between">
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
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnnonsPreview 
          id="1"
          imageUrl="/appartment.jpg" 
          address="Chalmers Tvärgata 10B"
          apartmentNumber="1000" 
          area="Johanneberg"
          city="Göteborg" 
          status="aktiv"
          uploadedDatetime="Igår kl. 14:23"
          data={{
            views: 123,
            applications: 12
          }}
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
          data={{
            views: 45,
            applications: 5
          }}

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
          data={{
            views: 78,
            applications: 8
          }}
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
          data={{
            views: 200,
            applications: 20
          }}
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
          data={{
            views: 150,
            applications: 15
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
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
          data={{
            views: 300,
            applications: 30
          }}
        />


      </div>

      
    </div>      
  )
}

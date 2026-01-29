import Search from "../_components/Search"
import { dashboardRelPath } from "../_statics/variables"
import NormalButton from "../_components/CTAButton"
import { DataTable } from "../_components/TanStackTable"
import Container from "../_components/Container"
import { AnnonsPreview } from "../_components/Annons"
import FilterButton from "../_components/FilterButton"




export default function Annonser() {
  return (
    <>
      <div className="mb-4 m-2 flex items-center gap-3 justify-between">
        <Search />
        <NormalButton text="Lägg till objekt" href={`${dashboardRelPath}/annonser/ny`} />
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


      </div>

      
    </>      
  )
}

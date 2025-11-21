import Search from "../_components/Search"
import CTAButton from "../_components/CTAButton"
import AnnonsTable from "../_components/AnnonsTable"
import { dashboardRelPath } from "../_statics/variables"








export default function Annonser() {
  return (
    <>
      <div className="mb-1 flex items-center gap-3 justify-between">
        <Search />
        <CTAButton text="Skapa annons" href={`${dashboardRelPath}/ny`} />
      </div>

      <AnnonsTable />
      
    </>      
  )
}

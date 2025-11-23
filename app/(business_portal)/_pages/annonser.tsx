import Search from "../_components/Search"
import { dashboardRelPath } from "../_statics/variables"
import NormalButton from "../_components/CTAButton"
import { DataTable } from "../_components/TanStackTable"
import Container from "../_components/Container"




export default function Annonser() {
  return (
    <>
      <div className="mb-4 m-2 flex items-center gap-3 justify-between">
        <Search />
        <NormalButton text="Lägg till objekt" href={`${dashboardRelPath}/annonser/ny`} />
      </div>

      <Container>
        <DataTable />
      </Container>

      
    </>      
  )
}

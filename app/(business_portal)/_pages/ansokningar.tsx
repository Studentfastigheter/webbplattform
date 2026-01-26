import AnnonsTable from "../_components/AnnonsTable";
import ApplicantsDistributionChart from "../_components/ApplicantsDistributionChart";
import ApplicantsTable from "../_components/ApplicantsTable";
import NewApplications from "../_components/NewApplications";
import StatisticsContainer from "../_components/StatisticsContainer";
import { DataTable } from "../_components/TanStackTable";
import TotalApplicantsChart from "../_components/TotalApplicantsChart";

const applications = [
    { name: "Karl Karlsson", age: 18, address: "Chalmers tvärgata 2" },
    { name: "Johan Johansson", age: 18, address: "Chalmers tvärgata 3" },
    { name: "Anna Andersson", age: 22, address: "Chalmers tvärgata 4" },
];

export default function Ansokningar() {
  return (
    <div>
      
      <StatisticsContainer />

        
        
      <div className="grid grid-cols-12 md:grid-cols-9">
      
        {/* <NewApplications className="col-span-3" applications={applications} /> */}
        <ApplicantsTable className="col-span-12" />

      </div>
        
    </div>
  )
}

import { getApplicantsTableData, getRecentApplications, getStatistics } from "@/lib/actions";
import ApplicantsTable from "../_components/ApplicantsTable";
import StatisticsContainer from "../_components/Statistics/StatisticsContainer";
import { StatisticProps } from "../_statics/types";
import { AvailableStatistics } from "@/lib/definitions";


export default function Ansokningar() {

  
    const selectedStatistics: AvailableStatistics[] = ["applications", "views", "interactions", "active_posts"];
    const statisticsPromise: Promise<StatisticProps[]> = getStatistics({ statisticsToFetch: selectedStatistics })
    const applicantsTableProps = getApplicantsTableData({ pageSize: 20 })


  return (
    <div>
      
      <StatisticsContainer statisticsPromise={statisticsPromise} />

        
        
      <div className="grid grid-cols-12 md:grid-cols-9">
      
        {/* <NewApplications className="col-span-3" applications={applications} /> */}
        <ApplicantsTable className="col-span-12" applicantsTableProps={applicantsTableProps} />

      </div>
        
    </div>
  )
}

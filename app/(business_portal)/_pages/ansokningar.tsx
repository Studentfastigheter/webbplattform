import { getStatistics } from "@/lib/actions";
import ApplicantsTable, { Application } from "../_components/ApplicantsTable";
import StatisticsContainer from "../_components/Statistics/StatisticsContainer";
import { StatisticProps } from "../_statics/types";
import { AvailableStatistics } from "@/lib/definitions";

const applications: Application[] = [
  {
    id: "m5gr84i9",
    name: "Bengt Svensson",
    object: "Chalmers tvärgata lgh 1001",
    status: "accepted",
    email: "ken99@example.com",
    createdAt: "2026-01-28T12:00:00Z",
  },

    {
    id: "xj4lm9z2",
    name: "Anna Karlsson",
    object: "Chalmers tvärgata lgh 1002",
    status: "pending",
    email: "anna.karlsson@example.com",
    createdAt: "2026-01-18T12:00:00Z",
  },
    {
    id: "a8n3k2p0",
    name: "Johan Eriksson",
    object: "Chalmers tvärgata lgh 1003",
    status: "reviewed",
    email: "johan.eriksson@example.com",
    createdAt: "2026-01-22T12:00:00Z",
  },
  {
    id: "q7w5e1r4",
    name: "Maria Nilsson",
    object: "Bostadskö",
    status: "rejected",
    email: "maria.nilsson@example.com",
    createdAt: "2026-01-30T12:00:00Z",
  },


]


export default function Ansokningar() {

  
    const selectedStatistics: AvailableStatistics[] = ["applications", "views", "interactions", "active_posts"];
    const statisticsPromise: Promise<StatisticProps[]> = getStatistics({ statisticsToFetch: selectedStatistics })

  return (
    <div>
      
      <StatisticsContainer statisticsPromise={statisticsPromise} />

        
        
      <div className="grid grid-cols-12 md:grid-cols-9">
      
        {/* <NewApplications className="col-span-3" applications={applications} /> */}
        <ApplicantsTable className="col-span-12" applications={applications} />

      </div>
        
    </div>
  )
}

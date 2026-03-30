"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import FilterButton from "../_components/FilterButton";
import StatisticsContainer from "../_components/Statistics/StatisticsContainer";
import NewApplications from "../_components/NewApplications";
import ApplicantsDistributionChart from "../_components/ApplicantsDistributionChart";
import TotalApplicantsChart from "../_components/TotalApplicantsChart";
import { AvailableStatistics } from "@/lib/definitions";
import { StatisticProps } from "../_statics/types";
import { getStatistics } from "@/lib/actions";
import VacancyGraph from "../_components/Graphs/VacancyGraph";
import { useAuth } from "@/context/AuthContext";

const filterOptions = [
  { value: "alla", label: "Alla städer" },
  { value: "stockholm", label: "Stockholm" },
  { value: "goteborg", label: "Göteborg" },
  { value: "malmo", label: "Malmö" },
]

const applications = [
    { name: "Karl Karlsson", age: 18, address: "Chalmers tvärgata 2" },
    { name: "Johan Johansson", age: 18, address: "Chalmers tvärgata 3" },
    { name: "Anna Andersson", age: 22, address: "Chalmers tvärgata 4" },
];

export default function Home() {

  const selectedStatistics: AvailableStatistics[] = ["applications", "views", "interactions", "active_posts"];
  const statisticsPromise: Promise<StatisticProps[]> = getStatistics({ statisticsToFetch: selectedStatistics })

  const router = useRouter();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    (async () => {
      if (user !== null) {
        return;
      }
      try {
        await refreshUser();
      } catch (err) {
        console.error(err);
        router.push("/logga-in");
      }
    })();
  }, []);

  return user === null ? (<></>) : (
    <>
      <div className="p-2 flex justify-between items-center mt-2">
        <h1 className="text-brand text-2xl font-bold">{`Välkommen tillbaka, ${user.displayName}`}</h1>
        <div className="flex gap-4">
          <FilterButton 
            options={filterOptions} 
            icon={<Building2 size={16} className="mr-0.5"/>} 
          />
        </div>
      </div>

      <StatisticsContainer statisticsPromise={statisticsPromise} />

      <div className="grid grid-cols-12 md:grid-cols-9">
        
        <TotalApplicantsChart className="col-span-3" />
        <ApplicantsDistributionChart className="col-span-3" />
        <NewApplications className="col-span-3" applications={applications} />
      

      </div>

      <VacancyGraph />
    </>
  )
}

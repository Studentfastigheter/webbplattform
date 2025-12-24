import { Box, Building2, Calendar, Clock, CopyPlus, House, ScrollText, Users } from "lucide-react";
import Statistic from "../_components/Statistic";
import PropertyList from "../_components/PropertyList";
import InvoiceChart from "../_components/InvoiceChart";
import QuickActions from "../_components/QuickActions";
import BarChart from "../_components/BarChart";
import FilterButton from "../_components/FilterButton";
import AddStatistic from "../_components/AddStatistic";
import StatisticsContainer from "../_components/StatisticsContainer";
import NewApplications from "../_components/NewApplications";

const timeOptions = [
  { value: "1y", label: "1 år" },
  { value: "3y", label: "3 år" },
  { value: "6m", label: "6 mån" },
  { value: "3m", label: "3 mån" },
  { value: "1m", label: "1 mån" },
]

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
  return (
    <>
      <div className="p-2 flex justify-between items-center">
        <h1 className="text-brand text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <FilterButton 
            options={timeOptions} 
            icon={<Calendar size={16} className="mr-0.5"/>} 
          />
          <FilterButton 
            options={filterOptions} 
            icon={<Building2 size={16} className="mr-0.5"/>} 
          />
        </div>
      </div>

      <StatisticsContainer />

      <div className="grid grid-cols-12 md:grid-cols-9">
        
        <NewApplications className="col-span-3" applications={applications} />
      
        <PropertyList className="col-span-6" />
        <BarChart className="col-span-5" />
        <InvoiceChart className="col-span-3" />
        
        <QuickActions className="col-span-2" />

      </div>
    </>
  )
}

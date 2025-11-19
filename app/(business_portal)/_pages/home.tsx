import { House, ScrollText, Wallet } from "lucide-react";
import Statistic from "../_components/Statistic";
import PropertyList from "../_components/PropertyList";
import InvoiceChart from "../_components/InvoiceChart";
import QuickActions from "../_components/QuickActions";
import BarChart from "../_components/BarChart";
import FilterButton from "../_components/FilterButton";

const filterOptions = [
  { value: "alla", label: "Alla städer" },
  { value: "stockholm", label: "Stockholm" },
  { value: "goteborg", label: "Göteborg" },
  { value: "malmo", label: "Malmö" },
]

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-full">
      <div className="mx-2 pt-3 mb-1 flex">
        <FilterButton options={filterOptions} />
      </div>

      <div className="grid grid-cols-12">
        <Statistic background="#C9D9C2" columnSpan={3} icon={<Wallet color="#0F2A14" />} label="Intäkter förra månaden" data="30" unit="kkr" />
        <Statistic background="#F4D8E4" columnSpan={3} icon={<House color="#2A0F1A" />} label="Uthyrda lägenheter" data="30" unit="st" />
        <Statistic background="#C7D8EB" columnSpan={3} icon={<ScrollText color="#0B1F2A" />} label="Annonser" data="4" unit="st" />
        <Statistic background="#C7D8EB" columnSpan={3} icon={<ScrollText color="#0B1F2A" />} label="Annonser" data="4" unit="st" />
      
        <PropertyList columnSpan={7} />
        <BarChart columnSpan={5} />
        <InvoiceChart columnSpan={3} />
        
        <QuickActions columnSpan={2} />

      </div>
    </div>
  )
}

import { Box, CopyPlus, House, ScrollText, Users } from "lucide-react";
import Statistic from "../_components/Statistic";
import PropertyList from "../_components/PropertyList";
import InvoiceChart from "../_components/InvoiceChart";
import QuickActions from "../_components/QuickActions";
import BarChart from "../_components/BarChart";
import FilterButton from "../_components/FilterButton";
import Container from "../_components/Container";
import Link from "next/link";
import AddStatistic from "../_components/AddStatistic";

const filterOptions = [
  { value: "alla", label: "Alla städer" },
  { value: "stockholm", label: "Stockholm" },
  { value: "goteborg", label: "Göteborg" },
  { value: "malmo", label: "Malmö" },
]

export default function Home() {
  return (
    <>
      <div className="m-2 flex justify-between items-center">
        <h1 className="text-brand text-2xl font-bold">Dashboard</h1>
        <FilterButton options={filterOptions} />
      </div>

      <div className="grid grid-cols-12">
        <Statistic background="#C7D8EB" columnSpan={2} icon={<Box size={14} className="text-neutral-400" />} label="Antal objekt" data="40" changeInPercent={3.4} />
        <Statistic background="#F4D8E4" columnSpan={2} icon={<House size={14} className="text-neutral-400" />} label="Lediga bostäder" data="12" changeInPercent={-3.5} increaseDirection="down" />
        <Statistic background="#C9D9C2" columnSpan={2} icon={<Users size={14} className="text-neutral-400" />} label="Antal hyresgäster" data="1325" changeInPercent={-2.5}/>
        <Statistic background="#C7D8EB" columnSpan={2} icon={<ScrollText size={14} className="text-neutral-400" />} label="Aktiva annonser" data="4" changeInPercent={2.5} />
        <AddStatistic columnSpan={1} />
      
        <PropertyList columnSpan={7} />
        <BarChart columnSpan={5} />
        <InvoiceChart columnSpan={3} />
        
        <QuickActions columnSpan={2} />

      </div>
    </>
  )
}

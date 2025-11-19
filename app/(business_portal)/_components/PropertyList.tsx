"use client"
import { useState } from "react";

import { ChevronDown, ExternalLink } from "lucide-react"
import Container from "./Container"
import Link from "next/link";

const properties = [
  {
    id: 1,
    name: "Lägenhet 1",
    location: "Stockholm",
    rent: 5000,
  },
  {
    id: 2,
    name: "Lägenhet 2",
    location: "Stockholm",
    rent: 5000,
  },
  {
    id: 3,
    name: "Lägenhet 3",
    location: "Stockholm",
    rent: 5000,
  },
]

const sortOptions = [
  { value: "newest", label: "Nyast" },
  { value: "expensive", label: "Dyrast" },
  { value: "cheap", label: "Billigast" },
]

export default function PropertyList({
  columnSpan,
}: {
  columnSpan: number,
}) {

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState(sortOptions[0].value);

  return (
    <Container columnSpan={columnSpan}>
      <div className="flex gap-16 items-center">
        <h2 className="text-xl font-semibold text-slate-900">Dina bostäder</h2>
        <div className="flex gap-8 flex-1">
          <p className="text-sm text-slate-600">Visar 3 av 400</p>
          <Link href="" className="text-sm text-gray-800 font-semibold hover:underline flex gap-2 items-center">Se alla bostäder <ExternalLink size={16} /></Link>
        </div>
        <div className="relative">
          <button onClick={() => setFilterOpen(prev => !prev)} className={`bg-gray-800 text-white text-sm font-semibold rounded-sm ${filterOpen ? "rounded-b-none" : "rounded-b-sm"} px-2.5 py-1 flex gap-1 cursor-pointer`}>
            {sortOptions.find(option => option.value === sortOption)?.label} 
            <ChevronDown size={16} />
          </button>
          <ul className="absolute text-sm top-7 right-0 left-0 border border-slate-200 bg-white rounded-b-sm shadow-md z-10 px-1 pb-0.5" style={{display: filterOpen ? "block" : "none"}}>
            {sortOptions.map(option => {
              if (option.value === sortOption) return null;
              return (
                <li key={option.value} className="border-b border-slate-200 last:border-none"><button className="w-full py-2.5 cursor-pointer" onClick={() => {setSortOption(option.value); setFilterOpen(false)}}>{option.label}</button></li>
              )
            })}
          </ul>
        </div>
      </div>


      <table className="mt-8">
        <thead></thead>
        <tbody>
          <tr className="text-left">
            <th className="pr-12 py-4">Adress</th>
            <th className="pr-12 py-4">Stad</th>
            <th className="pr-12 py-4">Hyra</th>
            <th className="pr-12 py-4">Senaste faktura</th>
            <th className="pr-12 py-4">Betald</th>
            <th className="pr-12 py-4">Åtgärder</th>
          </tr>
          {properties.map((property) => (
            <tr key={property.id} className="border-t border-neutral-200">
              <td className="pr-12 py-4">{property.name}</td>
              <td className="pr-12 py-4">{property.location}</td>
              <td className="pr-12 py-4">{property.rent} kr</td>
              <td className="pr-12 py-4">2024-05-01</td>
              <td className="pr-12 py-4"><div className="w-6 h-6 bg-green-600 rounded-full"></div></td>
              <td className="pr-12 py-4"><button className="bg-gray-800 text-white text-sm font-semibold rounded-full px-2.5 py-1 flex gap-1">Redigera</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  )
}
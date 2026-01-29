"use client"
import { useState } from "react";

import { ChevronDown, ExternalLink } from "lucide-react"
import Container from "./Container"
import Link from "next/link";
import NormalButton from "./NormalButton";
import FilterButton from "./FilterButton";

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

type PropertyListProps = React.HTMLAttributes<HTMLDivElement> & {

};

export default function PropertyList({
  ...props
}: PropertyListProps) {


  return (
    <Container {...props}>
      <div className="flex gap-16 items-center">
        <h2 className="text-xl font-semibold text-slate-900">Dina bostäder</h2>
        <div className="flex gap-8 flex-1">
          <p className="text-sm text-slate-600">Visar 3 av 400</p>
        </div>
        <FilterButton options={sortOptions} />
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
              <td className="pr-12 py-4"><NormalButton text="Redigera" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="" className="mt-8 text-sm text-gray-900 font-semibold hover:underline flex gap-2 items-center">Se alla bostäder <ExternalLink size={16} /></Link>
    </Container>
  )
}
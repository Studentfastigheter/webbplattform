"use client";

import { ChevronDown, Delete, Edit, ExternalLink, Link2, SquareCheck, SquareCheckBig, SquareIcon } from "lucide-react"
import React, { useState } from "react"
import { twMerge } from "tailwind-merge"

const keys = ["Adress", "Status", "Antal rum", "Hyra", "Publicerad", "ID", "Åtgärder"]
const nonExistingStates = {
  address: "Ingen adress angiven",
  rooms: "N/A",
  rent: "N/A",
  status: "N/A",
  published: "N/A"
}

const annonser = [
  {id: 1, address: "Storgatan 1, Stockholm", rooms: 3, rent: 12000, status: "Uthyrd", published: "2023-01-01"},
  {id: 2, address: "Lillgatan 2, Göteborg", rooms: 2, rent: 9000, status: "Ledig", published: "2023-02-15"},
  {id: 3, address: "Mellangatan 3, Malmö", rooms: 4, rent: 15000, status: "Uthyrd", published: "2023-03-10"},
  {id: 4, address: "", rooms: 2, rent: 4000, status: "Uthyrd", published: "2024-07-12"},
]


function SelectionBox({
  isSelected,
  onClick
}: {
  isSelected: boolean
  onClick: () => void
}) {
  

  return (
    
    isSelected ? 
    <SquareCheck 
      className="cursor-pointer"
      onClick={onClick}
    /> : 
    <SquareIcon 
      className="cursor-pointer" 
      onClick={onClick}
    />
    
  )

}


export default function AnnonsTable() {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  function ItemWrapper(
    { children, 
      className,
      index
    }: { 
      children: React.ReactNode,
      className?: string,
      index?: number
     }) {
    return (
      <div className={twMerge("px-6 py-4 flex h-full items-center", className, index !== undefined ? (index % 2 === 0 ? "bg-gray-100" : "bg-white") : "")}>
        {children}
      </div>
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.size === annonser.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(annonser.map((_, i) => i)))
    }
  }

  const handleSelectItem = (index: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedItems(newSelected)
  }

  const allSelected = selectedItems.size === annonser.length

  return (
    <div className="grid grid-cols-[auto_auto_repeat(6,minmax(0,1fr))] mt-4 py-4 bg-white rounded-xl shadow-md">
        
        <ItemWrapper>
          <SelectionBox isSelected={allSelected} onClick={handleSelectAll}/>
        </ItemWrapper>

        {keys.map((key) => (
          <ItemWrapper key={key} className="font-semibold">
            <p>{key}</p>
          </ItemWrapper>
        ))}




        {annonser.map((annons, index) => (
          <React.Fragment key={annons.id}>
            <ItemWrapper index={index}>
              <SelectionBox isSelected={selectedItems.has(index)} onClick={() => handleSelectItem(index)} />
            </ItemWrapper>
            <ItemWrapper index={index} className="relative">
              {annons.address || nonExistingStates.address}
            </ItemWrapper>
            <ItemWrapper index={index}>
              <div className={twMerge(annons.status === "Ledig" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", "px-2 py-1 rounded-full text-sm font-medium")}>
                {annons.status}
              </div>
            </ItemWrapper>
            <ItemWrapper index={index}>
              {annons.rooms || nonExistingStates.rooms}
            </ItemWrapper>
            <ItemWrapper index={index}>
              {annons.rent} kr/mån
            </ItemWrapper>
            <ItemWrapper index={index}>
              {annons.published}
            </ItemWrapper>
            <ItemWrapper index={index}>
              {annons.id}
            </ItemWrapper>
            <ItemWrapper className="gap-2" index={index}>
              <Edit size={18} className="cursor-pointer" />
              <Delete size={18} className="cursor-pointer" />
            </ItemWrapper>

          </React.Fragment>
        ))}
        
      </div>
  )

}
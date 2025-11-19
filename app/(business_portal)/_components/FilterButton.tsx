"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react"

type OptionType = {
    label: string;
    value: string;
}

export default function FilterButton({ 
  options,
}: {
  options: OptionType[];
}) {
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState(options[0].value);

  return(
    <div className="relative">
      <button onClick={() => setFilterOpen(prev => !prev)} className={`bg-gray-800 text-white text-sm font-semibold rounded-sm ${filterOpen ? "rounded-b-none" : "rounded-b-sm"} px-2.5 py-1 flex gap-1 cursor-pointer`}>
        {options.find(option => option.value === sortOption)?.label} 
        <ChevronDown size={16} />
      </button>
      <ul className="absolute text-sm top-7 right-0 left-0 border border-slate-200 bg-white rounded-b-sm shadow-md z-10 px-1 pb-0.5" style={{display: filterOpen ? "block" : "none"}}>
        {options.map(option => {
          if (option.value === sortOption) return null;
          return (
            <li key={option.value} className="border-b border-slate-200 last:border-none"><button className="w-full py-2.5 cursor-pointer" onClick={() => {setSortOption(option.value); setFilterOpen(false)}}>{option.label}</button></li>
          )
        })}
      </ul>
    </div>
  )
}
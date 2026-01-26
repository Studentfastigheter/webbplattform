"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react"

type OptionType = {
    label: string;
    value: string;
}

type FilterButtonProps = {
    options: OptionType[];
    icon?: React.ReactNode;
}

export default function FilterButton({ 
  options,
  icon
}: FilterButtonProps) {
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState(options[0].value);

  return(
    <div className="relative">
      <button onClick={() => setFilterOpen(prev => !prev)} className={`border border-neutral-100 hover:text-neutral-800 text-sm font-semibold rounded-sm ${filterOpen ? "rounded-b-none text-neutral-800" : "rounded-b-sm text-neutral-500"} px-4 py-2 flex gap-2 cursor-pointer`}>
        {icon}
        {options.find(option => option.value === sortOption)?.label} 
        <ChevronDown size={16} />
      </button>
      <ul className="absolute text-sm top-9 right-0 left-0 border border-neutral-200 bg-white rounded-b-sm z-10 px-5 pb-0.5" style={{display: filterOpen ? "block" : "none"}}>
        {options.map(option => {
          if (option.value === sortOption) return null;
          return (
            <li key={option.value} className="border-b border-neutral-200 last:border-none">
              <button 
              className="w-full py-2.5 cursor-pointer" 
              onClick={() => {
                setSortOption(option.value); 
                setFilterOpen(false)
              }}>
              {option.label}
            </button></li>
          )
        })}
      </ul>
    </div>
  )
}
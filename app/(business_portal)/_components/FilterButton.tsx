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
      <button onClick={() => setFilterOpen(prev => !prev)} className={`flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-theme-xs transition hover:bg-gray-50 ${filterOpen ? "text-gray-900" : "text-gray-600"}`}>
        {icon}
        {options.find(option => option.value === sortOption)?.label} 
        <ChevronDown size={16} />
      </button>
      <ul className="absolute left-0 right-0 top-11 z-10 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm shadow-theme-md" style={{display: filterOpen ? "block" : "none"}}>
        {options.map(option => {
          if (option.value === sortOption) return null;
          return (
            <li key={option.value}>
              <button 
              className="w-full cursor-pointer rounded-md px-2 py-2 text-left text-gray-700 hover:bg-gray-50" 
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

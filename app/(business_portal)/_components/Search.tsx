"use client";
import { SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <div className="focus-within:border-neutral-300 focus-within:shadow-md transition-all duration-75 py-2 px-4 bg-white rounded-full flex text-sm max-w-xl flex-1 shadow-sm border-slate-200 border">
      <SearchIcon className="inline-block mr-2 text-neutral-400" />
      <input type="text" placeholder="Sök annonser" className="w-full outline-none" />
    </div>
  );
}
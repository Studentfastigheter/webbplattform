"use client";
import { SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <div className="flex h-11 max-w-xl flex-1 items-center rounded-lg border border-gray-200 bg-white px-4 text-sm shadow-theme-xs transition focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10">
      <SearchIcon className="mr-2 h-5 w-5 text-gray-400" />
      <input type="text" placeholder="Sök annonser" className="w-full outline-none placeholder:text-gray-400" />
    </div>
  );
}

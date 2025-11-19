import { SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <div className="p-4 bg-white rounded-md flex text-sm max-w-xl flex-1 shadow-sm">
      <SearchIcon className="inline-block mr-2 text-neutral-400" />
      Sök annonser
    </div>
  );
}
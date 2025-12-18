"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function ConversationsHeader({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div className="p-4 border-b">
      <div className="text-lg font-semibold tracking-tight mb-4">Meddelanden</div>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Sök konversationer..."
          className="pl-9 bg-muted/50"
        />
      </div>
    </div>
  );
}
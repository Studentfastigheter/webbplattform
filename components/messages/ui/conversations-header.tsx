"use client";

import { Input } from "@/components/ui/input";

export function ConversationsHeader({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium">Konversationer</div>
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Sök..."
        className="mt-2"
      />
    </div>
  );
}

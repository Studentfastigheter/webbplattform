"use client";

import { Clock3 } from "lucide-react";
import CardShell from "./CardShell";

export type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
};

export default function ActivityListCard({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: ActivityItem[];
}) {
  return (
    <CardShell description={description} title={title}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <article className="rounded-lg border border-gray-100 bg-gray-50 p-3" key={`${item.id}-${index}`}>
            <p className="text-theme-sm font-semibold text-gray-800">{item.title}</p>
            <p className="mt-0.5 text-theme-xs text-gray-500">{item.subtitle}</p>
            <p className="mt-2 flex items-center gap-1.5 text-theme-xs text-gray-400">
              <Clock3 className="h-3.5 w-3.5" />
              {item.meta}
            </p>
          </article>
        ))}
      </div>
    </CardShell>
  );
}

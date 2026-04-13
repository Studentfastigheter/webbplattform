"use client";

import Image from "next/image";
import CardShell from "./CardShell";
import StatusBadge from "./StatusBadge";

export type TopListingRow = {
  id: number | string;
  name: string;
  meta: string;
  imageUrl?: string;
  applications: number;
  share: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "error" | "info";
};

export default function TopListingsTableCard({
  title,
  description,
  rows,
}: {
  title: string;
  description?: string;
  rows: TopListingRow[];
}) {
  return (
    <CardShell className="xl:col-span-2" description={description} title={title}>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-y border-gray-100">
            <tr>
              {["Objekt", "Ansökningar", "Andel", "Status"].map((heading) => (
                <th className="py-3 text-theme-xs font-medium text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100">
                      <Image
                        alt={row.name}
                        className="h-[50px] w-[50px] object-cover"
                        height={50}
                        src={row.imageUrl ?? "/appartment.jpg"}
                        width={50}
                      />
                    </div>
                    <div>
                      <p className="text-theme-sm font-medium text-gray-800">{row.name}</p>
                      <span className="text-theme-xs text-gray-500">{row.meta}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-theme-sm text-gray-500">
                  {row.applications.toLocaleString("sv-SE")}
                </td>
                <td className="py-3 text-theme-sm text-gray-500">{row.share}</td>
                <td className="py-3">
                  <StatusBadge tone={row.statusTone}>{row.statusLabel}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}


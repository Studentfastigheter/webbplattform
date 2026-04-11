"use client";

import CardShell from "./CardShell";

export type FunnelStep = {
  label: string;
  value: number;
};

const barColors = ["bg-brand-300", "bg-brand-400", "bg-brand-500", "bg-brand-600"];

export default function FunnelCard({
  title,
  description,
  steps,
}: {
  title: string;
  description?: string;
  steps: FunnelStep[];
}) {
  const maxValue = Math.max(...steps.map((step) => step.value), 1);

  return (
    <CardShell description={description} title={title}>
      <div className="grid gap-4">
        {steps.map((step, index) => {
          const width = `${Math.max(12, (step.value / maxValue) * 100)}%`;
          const colorClass = barColors[index] ?? "bg-brand-500";

          return (
            <div key={step.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-theme-sm font-medium text-gray-700">{step.label}</span>
                <span className="text-theme-sm text-gray-500">
                  {step.value.toLocaleString("sv-SE")}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100">
                <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}


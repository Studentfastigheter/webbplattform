"use client";

import {
  FunnelArc,
  FunnelAxis,
  FunnelAxisLabel,
  FunnelChart,
  FunnelSeries,
  type ChartShallowDataShape,
} from "reaviz";
import CardShell from "./CardShell";

export type FunnelStep = {
  label: string;
  value: number;
};

const funnelColors = ["#3f9369", "#047857", "#004225"];

export default function FunnelCard({
  title,
  description,
  steps,
}: {
  title: string;
  description?: string;
  steps: FunnelStep[];
}) {
  const data: ChartShallowDataShape<number>[] = steps.map((step) => ({
    key: step.label,
    data: step.value,
  }));

  return (
    <CardShell description={description} title={title}>
      <div className="h-[260px]">
        <FunnelChart
          data={data}
          margins={20}
          series={
            <FunnelSeries
              arc={
                <FunnelArc
                  colorScheme={funnelColors}
                  gradient={null}
                  interpolation="smooth"
                  variant="layered"
                />
              }
              axis={
                <FunnelAxis
                  label={
                    <FunnelAxisLabel
                      fill="#344054"
                      fontSize={12}
                      showValue
                    />
                  }
                />
              }
            />
          }
        />
      </div>
    </CardShell>
  );
}

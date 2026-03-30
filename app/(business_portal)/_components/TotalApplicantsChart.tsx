"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import { companyService, type Timeline } from "@/services/company";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";

export const description = "A line chart"

const chartConfig = {
  queuers: {
    label: "Köande",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type Props = {
    className?: string,
}

// formats date range as:
//  month - month year (if on the same year)
//  month year - mohth year (otherwise)
function dateRangeString(previous: Date, current: Date): string {
  const monthNames = [
    "januari", "februari", "mars", "april", "maj", "juni",
    "juli", "augusti", "september", "october", "november", "december"
  ];

  const prevMonth = monthNames[previous.getMonth()];
  const currMonth = monthNames[current.getMonth()];
  const prevYear = previous.getFullYear();
  const currYear = current.getFullYear();

  if (prevYear === currYear) {
    return `${prevMonth} - ${currMonth} ${prevYear}`;
  } else {
    return `${prevMonth} ${prevYear} - ${currMonth} ${currYear}`;
  }
}

function growthPercent(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0.0;

  const dx = xs[n-1] - xs[n-2];
  const dy = ys[n-1] - ys[n-2];

  return (dy / dx) * 100;
}

function growthThisMonth(timeline: Timeline): number {
  return growthPercent(timeline.map(({ timestamp }) => timestamp.getFullYear() * 12 + timestamp.getMonth()),
                       timeline.map(({ value }) => value));
}

function monthDistance(from: Date, to: Date): number {
  const fromMonths = from.getFullYear() * 12 + from.getMonth();
  const toMonths = to.getFullYear() * 12 + to.getMonth();
  return toMonths - fromMonths;
}

function monthFrom(month: Date, distance: number) {
  const totalMonths = (month.getFullYear() * 12 + month.getMonth()) + distance;
  return new Date(Math.round(totalMonths / 12), totalMonths % 12, month.getDay());
}

export default function TotalApplicantsChart({
    className,
}: Props) {

  const [chartData, setChartData] = useState<{ month: string, queuers: number }[]>([]);
  const [trend, setTrend] = useState(0.0);
  const [startDate, setStartDate] = useState(new Date(Date.now()));
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    (async () => {
      if (user === null) {
        try {
          await refreshUser();
        } catch (err) {
          console.error(err);
          return;
        }
      }
      if (user === null) {
        console.error("Could not get user");
        return;
      }
      const timeline: Timeline = await companyService
        .applicationsTimeline(user.id.toString())
        .catch(err => {
          console.error(err);
          return [];
        })
        .then(tl => tl.sort((a, b) => a.timestamp < b.timestamp ? -1 : (a.timestamp > b.timestamp ? 1 : 0)));


      console.log(`Timeline: ${
        JSON.stringify(
          timeline.map(({ timestamp, value }) =>
            ({ timestamp: timestamp.toLocaleString("sv-SE", { month: "long", year: "numeric" }), value: value })
          )
        )}`);

      // Get the results of the last 6 months
      const monthName = (date: Date): string =>
        date.toLocaleString("sv-SE", { month: "long" });
      const now = new Date(Date.now());
      const filteredTimeline = timeline.filter(({ timestamp }) => {
        const distance = monthDistance(timestamp, now);
        return distance >= 0 && distance < 6;
      });

      // Pad timeline to ensure there are no gap.
      const paddedTimeline = [];
      const timelineByTime: Map<number, number> = new Map();
      for (const { timestamp, value } of filteredTimeline) {
        timelineByTime.set(timestamp.getFullYear() * 12 + timestamp.getMonth(), value);
      }
      let prev: number = 0;
      for (let i = 0; i < 6; ++i) {
        const timestamp = monthFrom(now, -i);
        const month = timestamp.getFullYear() * 12 + timestamp.getMonth();
        if (timelineByTime.has(month)) {
          const value = timelineByTime.get(month) ?? 0;
          paddedTimeline.push({ timestamp: timestamp, value: value });
          prev = value;
        } else {
          paddedTimeline.push({ timestamp: timestamp, value: prev });
        }
      }
      paddedTimeline.reverse();

      console.log(`Padded timeline: ${
        JSON.stringify(
          paddedTimeline.map(({ timestamp, value }) =>
            ({ timestamp: timestamp.toLocaleString("sv-SE", { month: "long", year: "numeric" }), value: value })
          )
        )}`);

      const translated = paddedTimeline
        .map(({ timestamp, value }) => ({ month: monthName(timestamp), queuers: value }));
      setChartData(translated);
      setTrend(growthThisMonth(filteredTimeline));
      setStartDate(filteredTimeline[0].timestamp);
    })();
  }, []);

  const renderTrend = () => {
    console.log(`Trend=${trend}`);
    if (trend > 0) {
      return (
        <div className="flex gap-2 leading-none font-medium">
          {`Trendar uppåt med ${trend}% denna månad`} <TrendingUp className="h-4 w-4"/>
        </div>);
    } else if (trend < 0) {
      return (
      <div className="flex gap-2 leading-none font-medium">
        {`Trendar neråt med ${-trend}% denna månad`} <TrendingDown className="h-4 w-4"/>
      </div>);
    } else {
      return (
      <div className="flex gap-2 leading-none font-medium">
        Ingen ändring denna månad <Minus className="h-4 w-4"/>
      </div>);
    }
  };
  return (
    <div className={className}>
        <Card className="m-2">
            <CardHeader>
                <CardTitle>Nya ansökningar till bostadskö</CardTitle>
                <CardDescription>{dateRangeString(startDate, new Date(Date.now()))}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                    left: 12,
                    right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickCount={4}
                    />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                    dataKey="queuers"
                    type="natural"
                    fill="var(--chart-1)"
                    fillOpacity={0.4}
                    stroke="var(--chart-1)"
                    />
                </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                { renderTrend() }
                <div className="text-muted-foreground leading-none">
                Visar nya ansökningar för de senaste 6 månaderna
                </div>
            </CardFooter>
        </Card>
    </div>
  )
}

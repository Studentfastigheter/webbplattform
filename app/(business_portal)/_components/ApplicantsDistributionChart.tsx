"use client";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { companyService, type ObjectApplicationCount } from "@/services/company";
import { useAuth } from "@/context/AuthContext";
import { getActiveCompanyId } from "@/lib/company-access";

export const description = "A horizontal bar chart";

type ChartDataProps = {
    object: string;
    applications: number;
    href?: string;
};

const chartConfig = {
  applications: {
    label: "Ansökningar",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig


type CustomBarLabelProps = {
  x?: number;
  y?: number;
  value?: string | number;
};

const CustomBarLabel: React.FC<CustomBarLabelProps> = ({
  x = 0,
  y = 0,
  value = "",
}) => {
  const text = String(value);
  const truncated =
    text.length > 28 ? text.slice(0, 28) + "…" : text;

  return (
    <text
      x={x}
      y={y - 4}
      className="fill-foreground"
      fontSize={12}
    >
      {truncated}
    </text>
  );
};



type RightAlignedLabelProps = {
  y?: number;
  height?: number;
  value?: string | number;
};

const RightAlignedLabel: React.FC<RightAlignedLabelProps> = ({
  y = 0,
  height = 0,
  value,
}) => {
  return (
    <text
      x="100%"
      y={y + height / 2}
      dy="0.35em"
      textAnchor="end"
      className="fill-foreground"
      fontSize={12}
    >
      {value}
    </text>
  );
};


type Props = {
    className?: string,
}

export default function ApplicantsDistributionChart({
    className,
}: Props) {

  const router = useRouter();
  const [chartData, setChartData ] = useState<ChartDataProps[]>([]);
  const { user } = useAuth();

  useEffect(() => {
      (async () => {
          if (user === null) {
            console.error("User was not present.");
            return;
          }
          const companyId = getActiveCompanyId(user);
          if (companyId == null) {
            console.error("No company was present for the current user.");
            return;
          }
          const results: ObjectApplicationCount[] = await companyService.applicationCountsPerObject(companyId);
          setChartData(results.map(({ listingId, address, numApplications }) => ({
              object: address,
              applications: numApplications,
              href: `/portal/annonser/${listingId}`
          })));
      })();
  }, [user])

  return (
    <div className={className}>
        <Card className="m-2">
        <CardHeader>
            <CardTitle>Ansökningar per objekt</CardTitle>
            <CardDescription>Här visas dina objekt med flest ansökningar.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig}>
            <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{
                    left: 0,
                    right: 24,
                    top: 6
                }}
                barCategoryGap={10}
            >
                    <YAxis
                        dataKey="object"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={100}
                        hide
                    />
                    <XAxis dataKey="applications" type="number" hide />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent className="w-38" hideLabel />}
                    />
                    <Bar 
                        dataKey="applications" 
                        layout="vertical" 
                        radius={5} 
                        fill="var(--chart-1)"
                        className="cursor-pointer"
                        onClick={(data) => {
                            if (data?.payload?.href) {
                                router.push(data.payload.href)
                            }
                        }}
                    >
                        <LabelList 
                            dataKey="applications"
                            content={<RightAlignedLabel />}
                        />
                        <LabelList 
                            dataKey="object"
                            content={<CustomBarLabel />}
                        />
                    </Bar>
            </BarChart>
            </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
                Trendar uppåt med 3,8% denna månad <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
                Visar nya ansökningar för de senaste 6 månaderna
            </div>
        </CardFooter>
        </Card>
    </div>
  )
}

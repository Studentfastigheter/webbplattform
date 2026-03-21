"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"

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
import { useRouter } from "next/navigation"

export const description = "A horizontal bar chart"


type ChartDataProps = {
    object: string;
    applications: number;
    href?: string;
}


const chartData: ChartDataProps[] = [
  { object: "Chalmers tvärgata 13b", applications: 324, href: "/portal/annonser/1" },
  { object: "Chalmers tvärgata 14a", applications: 123, href: "/portal/annonser/2" },
  { object: "Chalmers tvärgata 15b", applications: 105, href: "/portal/annonser/3" },
  { object: "Chalmers tvärgata 16b", applications: 94, href: "/portal/annonser/4" },
//   { object: "Chalmers tvärgata 17b", applications: 78, href: "/portal/annonser/5" },
//   { object: "Lgh 1005", applications: 32, href: "/portal/annonser/6" },
]

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

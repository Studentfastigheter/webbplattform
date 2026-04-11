"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Filter,
  House,
  MessageSquareText,
  Search,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { ApplicantsTableProps } from "@/lib/definitions";
import ApplicantsTable from "./ApplicantsTable";

export type ApplicationsMode = "interest" | "queue";

const monthRows = [
  { month: "Jan", interest: 126, queue: 82, reviewed: 72, approved: 18, responseHours: 34 },
  { month: "Feb", interest: 148, queue: 91, reviewed: 88, approved: 21, responseHours: 31 },
  { month: "Mar", interest: 172, queue: 104, reviewed: 97, approved: 26, responseHours: 29 },
  { month: "Apr", interest: 188, queue: 116, reviewed: 121, approved: 31, responseHours: 26 },
  { month: "Maj", interest: 216, queue: 129, reviewed: 146, approved: 34, responseHours: 24 },
  { month: "Jun", interest: 242, queue: 143, reviewed: 167, approved: 38, responseHours: 22 },
  { month: "Jul", interest: 261, queue: 158, reviewed: 181, approved: 42, responseHours: 21 },
  { month: "Aug", interest: 298, queue: 176, reviewed: 205, approved: 49, responseHours: 19 },
  { month: "Sep", interest: 334, queue: 189, reviewed: 236, approved: 53, responseHours: 18 },
  { month: "Okt", interest: 358, queue: 202, reviewed: 251, approved: 58, responseHours: 17 },
  { month: "Nov", interest: 391, queue: 218, reviewed: 283, approved: 61, responseHours: 16 },
  { month: "Dec", interest: 428, queue: 236, reviewed: 308, approved: 67, responseHours: 15 },
];

const cityDistribution = [
  { city: "Göteborg", value: 46, fill: "var(--color-brand-500)" },
  { city: "Stockholm", value: 27, fill: "var(--color-brand-400)" },
  { city: "Malmö", value: 17, fill: "var(--color-brand-300)" },
  { city: "Uppsala", value: 10, fill: "var(--color-brand-200)" },
];

const statusDistribution = [
  { status: "Väntande", value: 38, fill: "var(--color-brand-300)" },
  { status: "Granskade", value: 31, fill: "var(--color-brand-500)" },
  { status: "Accepterade", value: 18, fill: "var(--color-success-500)" },
  { status: "Avvisade", value: 13, fill: "var(--color-error-500)" },
];

const chartConfig = {
  interest: { label: "Intresseanmälningar", color: "var(--color-brand-500)" },
  queue: { label: "Kö ansökningar", color: "var(--color-brand-300)" },
  reviewed: { label: "Granskade", color: "var(--color-brand-600)" },
  approved: { label: "Accepterade", color: "var(--color-success-500)" },
} satisfies ChartConfig;

function metricValue(mode: ApplicationsMode, period: string) {
  const rows = period === "30d" ? monthRows.slice(-2) : period === "90d" ? monthRows.slice(-4) : monthRows;
  const key = mode === "queue" ? "queue" : "interest";
  const total = rows.reduce((sum, row) => sum + row[key], 0);
  const reviewed = rows.reduce((sum, row) => sum + row.reviewed, 0);
  const approved = rows.reduce((sum, row) => sum + row.approved, 0);
  const response = Math.round(rows.reduce((sum, row) => sum + row.responseHours, 0) / rows.length);

  return { total, reviewed, approved, response };
}

function Badge({
  tone = "success",
  children,
}: {
  tone?: "success" | "error" | "warning";
  children: React.ReactNode;
}) {
  const toneClass = {
    success: "bg-success-50 text-success-700",
    error: "bg-error-50 text-error-700",
    warning: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", toneClass)}>
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  change,
  direction = "up",
  icon,
}: {
  label: string;
  value: string;
  change: string;
  direction?: "up" | "down";
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
        {icon}
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm text-gray-500">{label}</span>
          <h4 className="mt-2 text-title-sm font-bold text-gray-800">{value}</h4>
        </div>
        <Badge tone={direction === "up" ? "success" : "error"}>
          {direction === "up" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {change}
        </Badge>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-theme-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="h-10 rounded-lg border-gray-200 bg-white shadow-theme-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TrendChart({ mode, period }: { mode: ApplicationsMode; period: string }) {
  const rows = period === "30d" ? monthRows.slice(-6) : period === "90d" ? monthRows.slice(-9) : monthRows;
  const primaryKey = mode === "queue" ? "queue" : "interest";
  const title = mode === "queue" ? "Kö ansökningar över tid" : "Intresseanmälningar över tid";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 sm:px-6 sm:pt-6 xl:col-span-2">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="mt-1 text-theme-sm text-gray-500">Volym, granskning och accepterade ansökningar.</p>
        </div>
        <Badge>Livefilter aktivt</Badge>
      </div>
      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="h-[320px] min-w-[760px] xl:min-w-full" config={chartConfig}>
          <AreaChart data={rows} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="applicationPrimaryFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${primaryKey})`} stopOpacity={0.35} />
                <stop offset="95%" stopColor={`var(--color-${primaryKey})`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="month" tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
            <Area dataKey={primaryKey} fill="url(#applicationPrimaryFill)" stroke={`var(--color-${primaryKey})`} strokeWidth={2} type="natural" />
            <Area dataKey="reviewed" fill="transparent" stroke="var(--color-reviewed)" strokeWidth={2} type="natural" />
            <Area dataKey="approved" fill="transparent" stroke="var(--color-approved)" strokeWidth={2} type="natural" />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}

function StatusChart() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800">Statusfördelning</h3>
        <p className="mt-1 text-theme-sm text-gray-500">Aktuell mix i valt filter.</p>
      </div>
      <ChartContainer className="h-[220px]" config={chartConfig}>
        <PieChart>
          <Pie data={statusDistribution} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={3}>
            {statusDistribution.map((entry) => (
              <Cell fill={entry.fill} key={entry.status} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        </PieChart>
      </ChartContainer>
      <div className="mt-4 grid gap-3">
        {statusDistribution.map((item) => (
          <div className="flex items-center justify-between" key={item.status}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.fill }} />
              <span className="text-theme-sm text-gray-600">{item.status}</span>
            </div>
            <span className="text-theme-sm font-medium text-gray-800">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CityChart({ mode }: { mode: ApplicationsMode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800">Städer</h3>
        <p className="mt-1 text-theme-sm text-gray-500">
          {mode === "queue" ? "Kötryck per stad." : "Intresse per stad."}
        </p>
      </div>
      <ChartContainer className="h-[240px]" config={chartConfig}>
        <BarChart data={cityDistribution} layout="vertical" margin={{ left: 0, right: 24 }}>
          <CartesianGrid horizontal={false} />
          <XAxis dataKey="value" hide type="number" />
          <YAxis axisLine={false} dataKey="city" tickLine={false} type="category" width={80} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
          <Bar dataKey="value" radius={5}>
            {cityDistribution.map((entry) => (
              <Cell fill={entry.fill} key={entry.city} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

function SmartInsights({ mode }: { mode: ApplicationsMode }) {
  const insights =
    mode === "queue"
      ? [
          "Kö ansökningar ökar snabbast i Göteborg under kvällstid.",
          "Objekt med komplett planritning får 18% fler kvalificerade sökande.",
          "Median kötid bland accepterade är 241 dagar.",
        ]
      : [
          "Intresseanmälningar ökar mest på objekt med fler än fyra bilder.",
          "Svar inom 24 timmar ger 12% högre konvertering till visning.",
          "Studentrum har lägst avhopp efter första kontakt.",
        ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800">Smarta insikter</h3>
        <p className="mt-1 text-theme-sm text-gray-500">Automatiska signaler från valt filter.</p>
      </div>
      <div className="grid gap-3">
        {insights.map((insight, index) => (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3" key={insight}>
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-theme-xs font-semibold text-brand-500">
              {index + 1}
            </div>
            <p className="text-theme-sm text-gray-700">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApplicationsInsights({
  mode,
  applicantsTableProps,
}: {
  mode: ApplicationsMode;
  applicantsTableProps: Promise<ApplicantsTableProps[]>;
}) {
  const [period, setPeriod] = React.useState("90d");
  const [city, setCity] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [objectType, setObjectType] = React.useState(mode === "queue" ? "queue" : "all");
  const metrics = metricValue(mode, period);
  const isQueue = mode === "queue";

  React.useEffect(() => {
    if (mode === "queue") setObjectType("queue");
  }, [mode]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-theme-sm text-gray-500">Ansökningar</p>
        <h1 className="text-2xl font-semibold text-gray-900">
          {isQueue ? "Kö ansökningar" : "Intresseanmälningar"}
        </h1>
        <p className="mt-1 max-w-3xl text-theme-sm text-gray-500">
          {isQueue
            ? "Följ kötryck, ködagar, granskning och antagning över tid."
            : "Följ intresse, konvertering, svarstid och kvalitet över tid."}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
        <div className="mb-4 flex items-center gap-2 text-theme-sm font-semibold text-gray-800">
          <Filter className="h-4 w-4 text-gray-500" />
          Filter
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect label="Period" onValueChange={setPeriod} options={[
            { label: "Senaste 30 dagar", value: "30d" },
            { label: "Senaste 90 dagar", value: "90d" },
            { label: "12 månader", value: "12m" },
          ]} value={period} />
          <FilterSelect label="Stad" onValueChange={setCity} options={[
            { label: "Alla städer", value: "all" },
            { label: "Göteborg", value: "goteborg" },
            { label: "Stockholm", value: "stockholm" },
            { label: "Malmö", value: "malmo" },
          ]} value={city} />
          <FilterSelect label="Status" onValueChange={setStatus} options={[
            { label: "Alla statusar", value: "all" },
            { label: "Väntande", value: "pending" },
            { label: "Granskade", value: "reviewed" },
            { label: "Accepterade", value: "accepted" },
            { label: "Avvisade", value: "rejected" },
          ]} value={status} />
          <FilterSelect label="Objekt" onValueChange={setObjectType} options={[
            { label: "Alla objekt", value: "all" },
            { label: "Studentrum", value: "student_room" },
            { label: "Lägenhet", value: "apartment" },
            { label: "Bostadskö", value: "queue" },
          ]} value={objectType} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        <MetricCard change="12,4%" icon={isQueue ? <House className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />} label={isQueue ? "Kö ansökningar" : "Intresseanmälningar"} value={metrics.total.toLocaleString("sv-SE")} />
        <MetricCard change="8,1%" icon={<Search className="h-6 w-6" />} label="Granskade" value={metrics.reviewed.toLocaleString("sv-SE")} />
        <MetricCard change="5,7%" icon={<CheckCircle2 className="h-6 w-6" />} label="Accepterade" value={metrics.approved.toLocaleString("sv-SE")} />
        <MetricCard change="9,3%" direction="down" icon={<Clock className="h-6 w-6" />} label="Snitt svarstid" value={`${metrics.response} h`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TrendChart mode={mode} period={period} />
        <StatusChart />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <CityChart mode={mode} />
        <SmartInsights mode={mode} />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800">Filterstatus</h3>
          <div className="mt-4 grid gap-3 text-theme-sm text-gray-600">
            <div className="flex justify-between"><span>Period</span><span className="font-medium text-gray-800">{period}</span></div>
            <div className="flex justify-between"><span>Stad</span><span className="font-medium text-gray-800">{city}</span></div>
            <div className="flex justify-between"><span>Status</span><span className="font-medium text-gray-800">{status}</span></div>
            <div className="flex justify-between"><span>Objekt</span><span className="font-medium text-gray-800">{objectType}</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {isQueue ? "Köansökningar" : "Intresseanmälningar"}
          </h3>
          <p className="text-theme-sm text-gray-500">Listan kan filtreras, sorteras och masshanteras.</p>
        </div>
        <ApplicantsTable applicantsTableProps={applicantsTableProps} initialFilterQueue={isQueue} />
      </div>
    </div>
  );
}

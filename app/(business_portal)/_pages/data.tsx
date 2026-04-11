"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  MousePointerClick,
  Users,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { dashboardRelPath } from "../_statics/variables";

type DataView = "overview" | "applications" | "listings" | "market" | "finance";

const tabs: { label: string; href: string; view: DataView }[] = [
  { label: "Översikt", href: `${dashboardRelPath}/data`, view: "overview" },
  { label: "Ansökningar", href: `${dashboardRelPath}/data/ansokningar`, view: "applications" },
  { label: "Annonser", href: `${dashboardRelPath}/data/annonser`, view: "listings" },
  { label: "Marknad", href: `${dashboardRelPath}/data/marknad`, view: "market" },
  { label: "Ekonomi", href: `${dashboardRelPath}/data/ekonomi`, view: "finance" },
];

const monthlyData = [
  { month: "Jan", applications: 142, views: 2180, listings: 18, conversion: 6.5 },
  { month: "Feb", applications: 168, views: 2475, listings: 20, conversion: 6.8 },
  { month: "Mar", applications: 211, views: 2860, listings: 22, conversion: 7.4 },
  { month: "Apr", applications: 246, views: 3304, listings: 24, conversion: 7.2 },
  { month: "Maj", applications: 288, views: 3740, listings: 25, conversion: 7.7 },
  { month: "Jun", applications: 341, views: 4210, listings: 29, conversion: 8.1 },
  { month: "Jul", applications: 377, views: 4880, listings: 31, conversion: 7.9 },
  { month: "Aug", applications: 429, views: 5410, listings: 34, conversion: 8.3 },
  { month: "Sep", applications: 463, views: 5830, listings: 36, conversion: 8.0 },
  { month: "Okt", applications: 498, views: 6215, listings: 39, conversion: 8.2 },
  { month: "Nov", applications: 532, views: 6740, listings: 41, conversion: 8.4 },
  { month: "Dec", applications: 578, views: 7195, listings: 43, conversion: 8.0 },
];

const cityData = [
  { city: "Göteborg", applications: 842, fill: "var(--color-brand-500)" },
  { city: "Stockholm", applications: 614, fill: "var(--color-brand-400)" },
  { city: "Malmö", applications: 388, fill: "var(--color-brand-300)" },
  { city: "Uppsala", applications: 251, fill: "var(--color-brand-200)" },
];

const funnelData = [
  { step: "Visningar", value: 7195 },
  { step: "Klick", value: 2140 },
  { step: "Sparade", value: 890 },
  { step: "Ansökningar", value: 578 },
];

const tableRows = [
  {
    id: "1",
    name: "Chalmers Tvärgata 10B",
    meta: "Johanneberg, Göteborg",
    image: "/appartment.jpg",
    views: "1 842",
    applications: 126,
    conversion: "6,8%",
    status: "Aktiv",
  },
  {
    id: "2",
    name: "Vasagatan 19",
    meta: "Innerstan, Göteborg",
    image: "/appartment.jpg",
    views: "1 391",
    applications: 98,
    conversion: "7,0%",
    status: "Aktiv",
  },
  {
    id: "3",
    name: "Gibraltargatan 8",
    meta: "Olofshöjd, Göteborg",
    image: "/appartment.jpg",
    views: "988",
    applications: 71,
    conversion: "7,2%",
    status: "Pausad",
  },
];

const chartConfig = {
  applications: {
    label: "Ansökningar",
    color: "var(--color-brand-500)",
  },
  views: {
    label: "Visningar",
    color: "var(--color-brand-300)",
  },
  listings: {
    label: "Annonser",
    color: "var(--color-brand-600)",
  },
  conversion: {
    label: "Konvertering",
    color: "var(--color-success-500)",
  },
} satisfies ChartConfig;

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

function CardMenu() {
  return (
    <button className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" type="button">
      <span className="block text-xl leading-none">...</span>
    </button>
  );
}

function DataTabs({ activeView }: { activeView: DataView }) {
  const pathname = usePathname();

  return (
    <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-lg bg-gray-100 p-0.5">
      {tabs.map((tab) => {
        const active = activeView === tab.view || pathname === tab.href;

        return (
          <Link
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-2 text-theme-sm font-medium transition hover:text-gray-900",
              active ? "bg-white text-gray-900 shadow-theme-xs" : "text-gray-500"
            )}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function StatisticsChartCard({ view }: { view: DataView }) {
  const title = {
    overview: "Statistik",
    applications: "Ansökningstrend",
    listings: "Annonsutveckling",
    market: "Efterfrågan per månad",
    finance: "Intäkter och prognos",
  }[view];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 sm:px-6 sm:pt-6 xl:col-span-2">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="mt-1 text-theme-sm text-gray-500">
            Senaste 12 månaderna, jämfört över hela portalen.
          </p>
        </div>
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
          {["Månad", "Kvartal", "År"].map((label, index) => (
            <button
              className={cn(
                "rounded-md px-3 py-2 text-theme-sm font-medium",
                index === 0 ? "bg-white text-gray-900 shadow-theme-xs" : "text-gray-500 hover:text-gray-900"
              )}
              key={label}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="h-[310px] min-w-[900px] xl:min-w-full" config={chartConfig}>
          <AreaChart data={monthlyData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="applicationsFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-applications)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-applications)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="viewsFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="month" tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={false} />
            <Area dataKey="views" fill="url(#viewsFill)" stroke="var(--color-views)" strokeWidth={2} type="natural" />
            <Area dataKey="applications" fill="url(#applicationsFill)" stroke="var(--color-applications)" strokeWidth={2} type="natural" />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}

function MonthlyBarCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Månadsvolym</h3>
          <p className="mt-1 text-theme-sm text-gray-500">Publicerade annonser och ansökningar.</p>
        </div>
        <CardMenu />
      </div>
      <div className="max-w-full overflow-x-auto">
        <ChartContainer className="-ml-5 h-[210px] min-w-[650px] pl-2 xl:min-w-full" config={chartConfig}>
          <BarChart data={monthlyData}>
            <CartesianGrid vertical={false} />
            <XAxis axisLine={false} dataKey="month" tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar dataKey="applications" fill="var(--color-applications)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="listings" fill="var(--color-listings)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

function TargetCard() {
  const data = [{ name: "Mål", value: 76, fill: "var(--color-brand-500)" }];

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100">
      <div className="rounded-2xl bg-white px-5 pb-10 pt-5 shadow-theme-sm sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Månadsmål</h3>
            <p className="mt-1 text-theme-sm text-gray-500">Ansökningar mot satt mål.</p>
          </div>
          <CardMenu />
        </div>
        <ChartContainer className="mx-auto h-[260px] max-w-[320px]" config={chartConfig}>
          <RadialBarChart
            data={data}
            endAngle={-275}
            innerRadius="80%"
            outerRadius="100%"
            startAngle={-85}
          >
            <RadialBar background cornerRadius={8} dataKey="value" />
            <text
              className="fill-gray-800 text-4xl font-semibold"
              dominantBaseline="middle"
              textAnchor="middle"
              x="50%"
              y="50%"
            >
              76%
            </text>
          </RadialBarChart>
        </ChartContainer>
        <p className="mx-auto mt-2 max-w-[380px] text-center text-sm text-gray-500">
          438 av 575 planerade ansökningar är uppnådda denna månad.
        </p>
      </div>
      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        {[
          ["Mål", "575"],
          ["Utfört", "438"],
          ["Kvar", "137"],
        ].map(([label, value], index) => (
          <div className="flex items-center gap-5 sm:gap-8" key={label}>
            {index > 0 && <div className="h-7 w-px bg-gray-200" />}
            <div>
              <p className="mb-1 text-center text-theme-xs text-gray-500 sm:text-sm">{label}</p>
              <p className="text-center text-base font-semibold text-gray-800 sm:text-lg">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CityCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Städer</h3>
          <p className="mt-1 text-theme-sm text-gray-500">Ansökningar per stad.</p>
        </div>
        <CardMenu />
      </div>
      <ChartContainer className="h-[220px]" config={chartConfig}>
        <PieChart>
          <Pie data={cityData} dataKey="applications" innerRadius={58} outerRadius={86} paddingAngle={3}>
            {cityData.map((entry) => (
              <Cell fill={entry.fill} key={entry.city} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        </PieChart>
      </ChartContainer>
      <div className="mt-4 grid gap-3">
        {cityData.map((item) => (
          <div className="flex items-center justify-between" key={item.city}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.fill }} />
              <span className="text-theme-sm text-gray-600">{item.city}</span>
            </div>
            <span className="text-theme-sm font-medium text-gray-800">
              {item.applications.toLocaleString("sv-SE")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FunnelCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Konvertering</h3>
          <p className="mt-1 text-theme-sm text-gray-500">Från visning till ansökan.</p>
        </div>
        <CardMenu />
      </div>
      <div className="grid gap-4">
        {funnelData.map((item, index) => {
          const max = funnelData[0].value;
          const width = `${Math.max(12, (item.value / max) * 100)}%`;

          return (
            <div key={item.step}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-theme-sm font-medium text-gray-700">{item.step}</span>
                <span className="text-theme-sm text-gray-500">{item.value.toLocaleString("sv-SE")}</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100">
                <div
                  className={cn("h-2.5 rounded-full", index === 0 ? "bg-brand-300" : "bg-brand-500")}
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopListingsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6 xl:col-span-2">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Bäst presterande annonser</h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50" type="button">
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50" type="button">
            Visa alla
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="border-y border-gray-100">
            <tr>
              {["Annons", "Visningar", "Ansökningar", "Konvertering", "Status"].map((heading) => (
                <th className="py-3 text-theme-xs font-medium text-gray-500" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableRows.map((row) => (
              <tr key={row.id}>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image alt="" className="h-[50px] w-[50px] object-cover" height={50} src={row.image} width={50} />
                    </div>
                    <div>
                      <p className="text-theme-sm font-medium text-gray-800">{row.name}</p>
                      <span className="text-theme-xs text-gray-500">{row.meta}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-theme-sm text-gray-500">{row.views}</td>
                <td className="py-3 text-theme-sm text-gray-500">{row.applications}</td>
                <td className="py-3 text-theme-sm text-gray-500">{row.conversion}</td>
                <td className="py-3">
                  <Badge tone={row.status === "Aktiv" ? "success" : "warning"}>{row.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ViewSpecificPanel({ view }: { view: DataView }) {
  if (view === "applications") {
    return (
      <>
        <MonthlyBarCard />
        <FunnelCard />
        <TopListingsTable />
      </>
    );
  }

  if (view === "listings") {
    return (
      <>
        <TopListingsTable />
        <MonthlyBarCard />
      </>
    );
  }

  if (view === "market") {
    return (
      <>
        <CityCard />
        <FunnelCard />
        <TopListingsTable />
      </>
    );
  }

  if (view === "finance") {
    return (
      <>
        <TargetCard />
        <MonthlyBarCard />
        <TopListingsTable />
      </>
    );
  }

  return (
    <>
      <MonthlyBarCard />
      <TargetCard />
      <CityCard />
      <FunnelCard />
      <TopListingsTable />
    </>
  );
}

export default function DataDashboard({ view = "overview" }: { view?: DataView }) {
  const title = {
    overview: "Data",
    applications: "Ansökningsdata",
    listings: "Annonsdata",
    market: "Marknadsdata",
    finance: "Ekonomidata",
  }[view];

  const description = {
    overview: "Samlad portaldata för efterfrågan, annonser och konvertering.",
    applications: "Följ ansökningar, statusflöden och studenternas beteende.",
    listings: "Se vilka objekt som driver visningar, klick och ansökningar.",
    market: "Jämför städer, områden och efterfrågan över tid.",
    finance: "Följ intäktsmål, prognos och värde per publicerad annons.",
  }[view];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-theme-sm text-gray-500">Company portal</p>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-theme-sm text-gray-500">{description}</p>
        </div>
        <DataTabs activeView={view} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        <MetricCard
          change="11,2%"
          icon={<Users className="h-6 w-6" />}
          label="Ansökningar"
          value="2 578"
        />
        <MetricCard
          change="8,6%"
          icon={<Eye className="h-6 w-6" />}
          label="Visningar"
          value="71 950"
        />
        <MetricCard
          change="4,1%"
          icon={<FileText className="h-6 w-6" />}
          label="Aktiva annonser"
          value="43"
        />
        <MetricCard
          change="2,4%"
          direction="down"
          icon={<MousePointerClick className="h-6 w-6" />}
          label="Svarstid"
          value="18 h"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <StatisticsChartCard view={view} />
        <div className="grid gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Objektstatus</h3>
            <p className="mt-1 text-theme-sm text-gray-500">43 aktiva, 8 väntar på publicering.</p>
            <div className="mt-5 grid gap-3">
              {[
                ["Aktiva", "43", "bg-brand-500"],
                ["Utkast", "8", "bg-brand-300"],
                ["Pausade", "5", "bg-gray-300"],
              ].map(([label, value, color]) => (
                <div className="flex items-center justify-between" key={label}>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-sm", color)} />
                    <span className="text-theme-sm text-gray-600">{label}</span>
                  </div>
                  <span className="text-theme-sm font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 text-success-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Kvalitet</h3>
            <p className="mt-1 text-theme-sm text-gray-500">92% av annonserna har komplett profil, bilder och svarsmall.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ViewSpecificPanel view={view} />
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ActivityIcon,
  BarChart3Icon,
  Building2Icon,
  CheckCircle2Icon,
  Code2Icon,
  FileJsonIcon,
  InfoIcon,
  KeyRoundIcon,
  ListChecksIcon,
  MapPinIcon,
  RefreshCwIcon,
  SchoolIcon,
  TagsIcon,
  Trash2Icon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from "@/features/admin/services/admin-service";
import type {
  AdminAddSchoolRequest,
  AdminCityPayload,
  AdminCompanyUserDTO,
  AdminCreateCompanyRequest,
  AdminCreatePOIRequest,
  AdminListingTagDTO,
  AdminListingTagDetailDTO,
  AdminLocationCategoryDTO,
  AdminModifyPOIRequest,
} from "@/types";

type AdminActionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  data?: unknown;
};

type JsonActionProps<TPayload> = {
  title: string;
  description: string;
  method: string;
  endpoint: string;
  defaultValue: TPayload;
  onSubmit: (payload: TPayload) => Promise<unknown>;
};

const ADMIN_TABS = [
  "tags",
  "schools",
  "locations",
  "companies",
  "accounts",
  "activities",
  "statistics",
  "legacy",
] as const;

export type AdminSection = (typeof ADMIN_TABS)[number];

const TAB_META: Record<
  AdminSection,
  { title: string; description: string }
> = {
  tags: {
    title: "Taggar för bostadsannonser",
    description:
      "Skapa, lista och uppdatera de attribut som används för att filtrera och beskriva annonser.",
  },
  schools: {
    title: "Skolor och campus",
    description:
      "Lägg till eller uppdatera skolor med stad och koordinater så att sökfilter och kartor fungerar rätt.",
  },
  locations: {
    title: "Platskategorier",
    description:
      "Hantera Google-kategorier som ligger bakom närliggande service och platsbaserade listor.",
  },
  companies: {
    title: "Bostadsföretag",
    description:
      "Skapa, uppdatera eller avaktivera företagsprofiler och deras systemkopplingar.",
  },
  accounts: {
    title: "Företagskonton",
    description:
      "Administrera användare, roller och kontaktuppgifter kopplade till företagsportalen.",
  },
  activities: {
    title: "Studentaktiviteter och POI",
    description:
      "Lista, skapa, uppdatera och ta bort aktiviteter som visas nära skolor och bostäder.",
  },
  statistics: {
    title: "Registrerade användare",
    description:
      "Hämta tidsserier för användarregistreringar inom ett valt datumintervall.",
  },
  legacy: {
    title: "Äldre stads-endpoints",
    description:
      "Verktyg för äldre stadsdata som fortfarande finns kvar av bakåtkompatibilitetsskäl.",
  },
};

type FetchActionProps = {
  title: string;
  description: string;
  endpoint: string;
  onFetch: () => Promise<unknown>;
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseJson<TPayload>(value: string): TPayload {
  try {
    return JSON.parse(value) as TPayload;
  } catch {
    throw new Error("JSON-payloaden är inte giltig.");
  }
}

function normalizeDateTimeInput(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function ResultBlock({ state }: { state: AdminActionState }) {
  if (state.status === "idle") {
    return null;
  }

  const isError = state.status === "error";
  const isLoading = state.status === "loading";

  return (
    <div
      className={[
        "mt-4 rounded-[8px] border px-4 py-3 text-sm",
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : isLoading
            ? "border-[#dfe7e3] bg-white text-[#36534d]"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
        ) : isLoading ? (
          <RefreshCwIcon className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <span>{state.message}</span>
      </div>

      {state.data !== undefined && (
        <pre className="mt-3 max-h-80 overflow-auto rounded-[8px] bg-[#202525] p-3 text-xs leading-5 text-white">
          {prettyJson(state.data)}
        </pre>
      )}
    </div>
  );
}

function EndpointBadge({ method, endpoint }: { method: string; endpoint: string }) {
  return (
    <code className="inline-flex max-w-full items-center gap-2 rounded-[8px] border border-[#dfe7e3] bg-white px-2.5 py-1.5 text-xs font-medium text-[#36534d] shadow-sm">
      <span className="rounded-[6px] bg-[#004225] px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {method}
      </span>
      <span className="break-all">{endpoint}</span>
    </code>
  );
}

function TabIntro({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="mb-4 rounded-[8px] border border-[#dfe7e3] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#004225] text-white">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#66716f]">
              {description}
            </p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function SectionContent({
  active,
  value,
  children,
}: {
  active: AdminSection;
  value: AdminSection;
  children: ReactNode;
}) {
  return active === value ? <>{children}</> : null;
}

function ActionShell({
  title,
  endpoint,
  method,
  description,
  children,
}: {
  title: string;
  endpoint: string;
  method: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-[#dfe7e3] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
          {description && (
            <p className="mt-1 text-sm leading-6 text-[#66716f]">{description}</p>
          )}
        </div>
        <EndpointBadge method={method} endpoint={endpoint} />
      </div>
      {children}
    </section>
  );
}

function JsonAction<TPayload>({
  title,
  description,
  method,
  endpoint,
  defaultValue,
  onSubmit,
}: JsonActionProps<TPayload>) {
  const [payload, setPayload] = useState(prettyJson(defaultValue));
  const [state, setState] = useState<AdminActionState>({ status: "idle" });

  async function run() {
    setState({ status: "loading", message: "Skickar..." });
    try {
      const result = await onSubmit(parseJson<TPayload>(payload));
      setState({
        status: "success",
        message: "Anropet gick igenom.",
        data: result,
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Anropet misslyckades.",
      });
    }
  }

  return (
    <ActionShell
      title={title}
      description={description}
      method={method}
      endpoint={endpoint}
    >
      <div className="mt-4 rounded-[8px] border border-[#edf2ef] bg-[#fbfcfb] p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#476e66]">
            <FileJsonIcon className="h-4 w-4" />
            JSON-payload
          </label>
          <span className="text-xs text-[#66716f]">Redigera exemplet innan du kör</span>
        </div>
        <Textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          className="min-h-48 border-[#dfe7e3] bg-white font-mono text-xs leading-5"
          spellCheck={false}
        />
      </div>
      <Button
        type="button"
        isLoading={state.status === "loading"}
        onPress={run}
        className="mt-4 bg-[#004225] text-white hover:bg-[#00351e]"
      >
        <Code2Icon className="h-4 w-4" />
        Kör anrop
      </Button>
      <ResultBlock state={state} />
    </ActionShell>
  );
}

function FetchAction({ title, description, endpoint, onFetch }: FetchActionProps) {
  const [state, setState] = useState<AdminActionState>({ status: "idle" });

  async function run() {
    setState({ status: "loading", message: "Hämtar..." });
    try {
      const result = await onFetch();
      setState({
        status: "success",
        message: "Data hämtad.",
        data: result,
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Anropet misslyckades.",
      });
    }
  }

  return (
    <ActionShell title={title} description={description} method="GET" endpoint={endpoint}>
      <Button
        type="button"
        isLoading={state.status === "loading"}
        onPress={run}
        className="mt-4 bg-[#004225] text-white hover:bg-[#00351e]"
      >
        <RefreshCwIcon className="h-4 w-4" />
        Hämta data
      </Button>
      <ResultBlock state={state} />
    </ActionShell>
  );
}

function DeleteIdAction({
  title,
  description,
  endpoint,
  label,
  onSubmit,
}: {
  title: string;
  description: string;
  endpoint: string;
  label: string;
  onSubmit: (id: number) => Promise<unknown>;
}) {
  const [id, setId] = useState("");
  const [state, setState] = useState<AdminActionState>({ status: "idle" });

  async function run() {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setState({ status: "error", message: "Ange ett numeriskt id." });
      return;
    }

    setState({ status: "loading", message: "Tar bort..." });
    try {
      const result = await onSubmit(numericId);
      setState({
        status: "success",
        message: "Delete-anropet gick igenom.",
        data: result,
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Anropet misslyckades.",
      });
    }
  }

  return (
    <ActionShell title={title} description={description} method="PUT" endpoint={endpoint}>
      <div className="mt-4 rounded-[8px] border border-red-100 bg-red-50/60 p-3">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-red-800">
          {label}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={id}
            onChange={(event) => setId(event.target.value)}
            inputMode="numeric"
            placeholder="Ange numeriskt id"
            className="h-10 rounded-[8px] border-red-200 bg-white"
          />
          <Button
            type="button"
            isLoading={state.status === "loading"}
            onPress={run}
            variant="destructive"
            className="bg-red-700 text-white hover:bg-red-800"
          >
            <Trash2Icon className="h-4 w-4" />
            Ta bort
          </Button>
        </div>
      </div>
      <ResultBlock state={state} />
    </ActionShell>
  );
}

function UserStatisticsAction() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [state, setState] = useState<AdminActionState>({ status: "idle" });

  async function run() {
    setState({ status: "loading", message: "Hämtar statistik..." });
    try {
      const result = await adminService.getUserStatistics({
        from: normalizeDateTimeInput(from),
        to: normalizeDateTimeInput(to),
      });
      setState({ status: "success", message: "Statistik hämtad.", data: result });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Anropet misslyckades.",
      });
    }
  }

  return (
    <ActionShell
      title="Registrerade användare"
      description="Välj start- och slutdatum för att hämta registreringar som tidsserie."
      method="GET"
      endpoint="/api/admin/statistics/users"
    >
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-[#476e66]">
          Från
          <Input
            type="datetime-local"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-10 rounded-[8px] border-[#dfe7e3] bg-white normal-case tracking-normal text-[#111827]"
          />
        </label>
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-[#476e66]">
          Till
          <Input
            type="datetime-local"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-10 rounded-[8px] border-[#dfe7e3] bg-white normal-case tracking-normal text-[#111827]"
          />
        </label>
      </div>
      <Button
        type="button"
        isLoading={state.status === "loading"}
        onPress={run}
        className="mt-3 bg-[#004225] text-white hover:bg-[#00351e]"
      >
        <BarChart3Icon className="h-4 w-4" />
        Hämta statistik
      </Button>
      <ResultBlock state={state} />
    </ActionShell>
  );
}

export function AdminToolPage({ section }: { section: AdminSection }) {
  const samples = useMemo(
    () => ({
      tagCreate: {
        tagKey: "BALCONY",
        displayName: "Balkong",
        icon: "balcony",
      } satisfies AdminListingTagDTO,
      tagModify: {
        tag: "BALCONY",
        displayName: "Balkong",
        icon: "balcony",
        tagValues: ["BALCONY", "Balkong", "balkong"],
      } satisfies AdminListingTagDetailDTO,
      school: {
        schoolName: "Linköpings universitet",
        city: "LINKOPING",
        lat: 58.397,
        lng: 15.576,
      } satisfies AdminAddSchoolRequest,
      locationCategory: {
        category: "GYM",
        googleType: "gym",
      } satisfies AdminLocationCategoryDTO,
      company: {
        companyDate: {
          companyName: "Studentbostäder AB",
          subtitle: "Studentlägenheter",
          logoUrl: "",
          privacyPolicyUrl: "",
          termsUrl: "",
          bannerUrl: "",
          socialLinks: {},
          description: "",
          pictureUrlList: [],
          videoUrlList: [],
          websiteUrl: "",
        },
        credentials: {
          companyName: "Studentbostäder AB",
          companySystemUrlOrigin: "",
          propertySystemUsername: "",
          propertySystemPassword: "",
          propertySystem: "DEMO",
        },
      } satisfies AdminCreateCompanyRequest,
      companyAccount: {
        id: 42,
        companyId: 1,
        role: {
          name: "MANAGER",
          description: "Kan administrera företaget",
          accessLevel: 50,
        },
        firstName: "Anna",
        surname: "Admin",
        email: "anna@example.com",
        phone: "+46701234567",
        bannerUrl: "",
        logoUrl: "",
      } satisfies AdminCompanyUserDTO,
      city: {
        id: 1,
        name: "LINKOPING",
      } satisfies AdminCityPayload,
      activityCreate: {
        category: "CAFE",
        name: "Campus Café",
        lat: 58.397,
        lng: 15.576,
      } satisfies AdminCreatePOIRequest,
      activityModify: {
        id: 1,
        category: "CAFE",
        name: "Campus Café",
        lat: 58.397,
        lng: 15.576,
      } satisfies AdminModifyPOIRequest,
    }),
    []
  );

  return (
    <main className="flex flex-col gap-6 text-[#1f2937]">
      <div className="flex flex-col gap-5">
        <SectionContent active={section} value="tags">
          <TabIntro
            icon={<TagsIcon className="h-5 w-5" />}
            title={TAB_META.tags.title}
            description={TAB_META.tags.description}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <FetchAction
              title="Lista taggar"
              description="Hämta alla taggar med visningsnamn, ikon och tillåtna värden."
              endpoint="/api/admin/tags"
              onFetch={adminService.getTags}
            />
            <JsonAction
              title="Skapa tagg"
              description="Lägg till en ny tagg som senare kan kopplas till bostadsannonser."
              method="POST"
              endpoint="/api/admin/tag"
              defaultValue={samples.tagCreate}
              onSubmit={adminService.createTag}
            />
            <JsonAction
              title="Uppdatera tagg"
              description="Ändra visningsnamn, ikon eller alternativa värden för en befintlig tagg."
              method="PUT"
              endpoint="/api/admin/tag?tag=..."
              defaultValue={samples.tagModify}
              onSubmit={adminService.modifyTag}
            />
          </div>
        </SectionContent>

        <SectionContent active={section} value="schools">
          <TabIntro
            icon={<SchoolIcon className="h-5 w-5" />}
            title={TAB_META.schools.title}
            description={TAB_META.schools.description}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <JsonAction
              title="Skapa skola"
              description="Registrera en ny skola med stad och koordinater för kartor och närhetsfilter."
              method="POST"
              endpoint="/api/admin/school"
              defaultValue={samples.school}
              onSubmit={adminService.createSchool}
            />
            <JsonAction
              title="Uppdatera skola"
              description="Uppdatera samma struktur när skolans namn, stad eller position behöver korrigeras."
              method="PUT"
              endpoint="/api/admin/school"
              defaultValue={samples.school}
              onSubmit={adminService.modifySchool}
            />
          </div>
        </SectionContent>

        <SectionContent active={section} value="locations">
          <TabIntro
            icon={<MapPinIcon className="h-5 w-5" />}
            title={TAB_META.locations.title}
            description={TAB_META.locations.description}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <FetchAction
              title="Lista platskategorier"
              description="Kontrollera vilka kategorier som redan finns innan du skapar en ny."
              endpoint="/api/admin/location-categories"
              onFetch={adminService.getLocationCategories}
            />
            <JsonAction
              title="Skapa platskategori"
              description="Skapa en kategori som mappar plattformens namn mot Googles platstyper."
              method="POST"
              endpoint="/api/admin/location-category"
              defaultValue={samples.locationCategory}
              onSubmit={adminService.addLocationCategory}
            />
            <JsonAction
              title="Uppdatera platskategori"
              description="Justera kategori eller Google-typ när platsdatan behöver synkas om."
              method="PUT"
              endpoint="/api/admin/location-category"
              defaultValue={samples.locationCategory}
              onSubmit={adminService.modifyLocationCategory}
            />
          </div>
        </SectionContent>

        <SectionContent active={section} value="companies">
          <TabIntro
            icon={<Building2Icon className="h-5 w-5" />}
            title={TAB_META.companies.title}
            description={TAB_META.companies.description}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800">
              <Trash2Icon className="h-4 w-4" />
              Soft delete via id
            </span>
          </TabIntro>

          <div className="grid gap-4 xl:grid-cols-2">
            <JsonAction
              title="Skapa företag"
              description="Skapa företagsprofil och systemuppgifter i samma payload."
              method="POST"
              endpoint="/api/admin/company"
              defaultValue={samples.company}
              onSubmit={adminService.createCompany}
            />
            <JsonAction
              title="Uppdatera företag"
              description="Uppdatera profilfält, media och systemkoppling för ett befintligt företag."
              method="PUT"
              endpoint="/api/admin/company"
              defaultValue={samples.company}
              onSubmit={adminService.modifyCompany}
            />
            <DeleteIdAction
              title="Ta bort företag"
              description="Avaktivera ett företag med numeriskt id. Kontrollera id:t innan du kör."
              endpoint="/api/admin/company/delete"
              label="Företags-id"
              onSubmit={adminService.deleteCompany}
            />
          </div>
        </SectionContent>

        <SectionContent active={section} value="accounts">
          <TabIntro
            icon={<UsersIcon className="h-5 w-5" />}
            title={TAB_META.accounts.title}
            description={TAB_META.accounts.description}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe7e3] bg-[#fbfcfb] px-3 py-1.5 text-xs font-medium text-[#36534d]">
              <KeyRoundIcon className="h-4 w-4 text-[#004225]" />
              Rollstyrt konto
            </span>
          </TabIntro>

          <div className="grid gap-4 xl:grid-cols-2">
            <JsonAction
              title="Hantera företagskonto"
              description="Skapa eller uppdatera konto, roll och kontaktuppgifter för en företagsanvändare."
              method="PUT"
              endpoint="/api/admin/company/account"
              defaultValue={samples.companyAccount}
              onSubmit={adminService.manageCompanyAccount}
            />
          </div>
        </SectionContent>

        <SectionContent active={section} value="activities">
          <TabIntro
            icon={<ActivityIcon className="h-5 w-5" />}
            title={TAB_META.activities.title}
            description={TAB_META.activities.description}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <FetchAction
              title="Lista aktiviteter"
              description="Hämta befintliga aktiviteter och POI innan du ändrar eller tar bort något."
              endpoint="/api/admin/activities"
              onFetch={adminService.getActivities}
            />
            <JsonAction
              title="Skapa aktivitet"
              description="Lägg till en ny aktivitet med kategori, namn och koordinater."
              method="POST"
              endpoint="/api/admin/activity"
              defaultValue={samples.activityCreate}
              onSubmit={adminService.createActivity}
            />
            <JsonAction
              title="Uppdatera aktivitet"
              description="Uppdatera en befintlig aktivitet genom att skicka med dess id."
              method="PUT"
              endpoint="/api/admin/activity"
              defaultValue={samples.activityModify}
              onSubmit={adminService.modifyActivity}
            />
            <DeleteIdAction
              title="Ta bort aktivitet"
              description="Ta bort eller avaktivera en aktivitet med numeriskt id."
              endpoint="/api/admin/activity/delete"
              label="Aktivitets-id"
              onSubmit={adminService.deleteActivity}
            />
          </div>
        </SectionContent>

        <SectionContent active={section} value="statistics">
          <TabIntro
            icon={<BarChart3Icon className="h-5 w-5" />}
            title={TAB_META.statistics.title}
            description={TAB_META.statistics.description}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <UserStatisticsAction />
          </div>
        </SectionContent>

        <SectionContent active={section} value="legacy">
          <TabIntro
            icon={<ListChecksIcon className="h-5 w-5" />}
            title={TAB_META.legacy.title}
            description={TAB_META.legacy.description}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
              <InfoIcon className="h-4 w-4" />
              Bakåtkompatibilitet
            </span>
          </TabIntro>

          <div className="grid gap-4 xl:grid-cols-2">
            <JsonAction
              title="Skapa stad"
              description="Skapa äldre stadsdata när backend fortfarande kräver city-endpointen."
              method="POST"
              endpoint="/api/admin/city"
              defaultValue={samples.city}
              onSubmit={adminService.createCity}
            />
            <JsonAction
              title="Uppdatera stad"
              description="Uppdatera id och namn för en befintlig stad i legacy-flödet."
              method="PUT"
              endpoint="/api/admin/city"
              defaultValue={samples.city}
              onSubmit={adminService.modifyCity}
            />
            <DeleteIdAction
              title="Ta bort stad"
              description="Ta bort eller avaktivera en stad med numeriskt id."
              endpoint="/api/admin/city/delete"
              label="Stads-id"
              onSubmit={adminService.deleteCity}
            />
          </div>
        </SectionContent>
      </div>
    </main>
  );
}

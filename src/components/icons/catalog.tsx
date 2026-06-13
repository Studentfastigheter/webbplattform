import * as React from "react";
import * as AppIcons from "@/components/icons";
import type { AppIcon, AppIconProps } from "@/components/icons";

export const APP_ICON_CATEGORIES = [
  "Bostadstyper",
  "Rum & ytor",
  "Bekvämligheter",
  "Läge & närhet",
  "Hyra & villkor",
  "Plattform",
  "Sociala medier",
  "Navigation",
  "Status",
  "Kommunikation",
  "Media",
  "Admin",
  "Data",
  "Ovrigt",
] as const;

export type AppIconCategory = (typeof APP_ICON_CATEGORIES)[number];

export type AppIconOption = {
  name: string;
  exportName: string;
  label: string;
  category: AppIconCategory;
  keywords: string[];
  Icon: AppIcon;
  searchText: string;
};

const ICON_NAME_BY_EXPORT: Record<string, string> = {
  Accessible: "accessible",
  Balcony: "balcony",
  BarChart3: "bar-chart",
  BarChart3Icon: "bar-chart",
  Bath: "bath",
  Bathroom: "bathroom",
  Bed: "bed",
  BedroomChild: "bedroom-child",
  BedroomParent: "bedroom-parent",
  Bike: "bike",
  Bolt: "bolt",
  Building2: "apartment",
  Building2Icon: "apartment",
  Bus: "bus",
  CheckCircle2Icon: "check-circle",
  Clock3: "schedule",
  Clock3Icon: "schedule",
  Contract: "contract",
  Cottage: "cottage",
  Countertops: "countertops",
  Deck: "deck",
  Dishwasher: "dishwasher",
  Domain: "domain",
  DoorFront: "door-front",
  Download01: "download",
  Edit03: "edit",
  Elevator: "elevator",
  EvStation: "ev-station",
  Facebook: "facebook",
  FaFacebook: "facebook",
  FaInstagram: "instagram",
  FaLinkedin: "linkedin",
  FaTiktok: "tiktok",
  FaYoutube: "youtube",
  Fence: "fence",
  File05: "file",
  FitnessCenter: "fitness-center",
  Floor: "floor",
  Foundation: "foundation",
  Garage: "garage",
  GraduationCapIcon: "graduation-cap",
  Grass: "grass",
  Grocery: "grocery",
  HeatPump: "heat-pump",
  HolidayVillage: "holiday-village",
  HomeIcon: "home",
  HouseShield: "house-shield",
  IconChevronDown: "chevron-down",
  IconMenu2: "menu",
  IconX: "close",
  Instagram: "instagram",
  Kitchen: "kitchen",
  Lightbulb: "lightbulb",
  Linkedin: "linkedin",
  Loader2Icon: "loader",
  LocalCafe: "local-cafe",
  MailIcon: "mail",
  MapIcon: "map",
  MapPinIcon: "map-pin",
  MoreHorizontalIcon: "more-horizontal",
  Parking: "parking",
  Payments: "payments",
  RealEstateAgent: "real-estate-agent",
  Restaurant: "restaurant",
  Roofing: "roofing",
  SaveIcon: "save",
  SearchIcon: "search",
  ShieldCheckIcon: "shield-check",
  Shower: "shower",
  SiThreads: "threads",
  Stairs: "stairs",
  Storefront: "storefront",
  Subway: "subway",
  TagsIcon: "tag",
  Thermostat: "thermostat",
  Trash01: "trash",
  Trash2Icon: "trash",
  Train: "train",
  Tram: "tram",
  Twitter: "x",
  UploadCloud02: "upload-cloud",
  UploadIcon: "upload",
  Users2: "users",
  UsersIcon: "users",
  UsersRound: "users",
  Villa: "villa",
  WaterDrop: "water-drop",
  Wc: "wc",
  WorkspacePremium: "workspace-premium",
  X: "close",
  XClose: "close",
  XIcon: "close",
};

const ICON_LABEL_BY_EXPORT: Record<string, string> = {
  Accessible: "Tillganglighetsanpassat",
  ActivityIcon: "Aktivitet",
  Balcony: "Balkong",
  Bath: "Badkar",
  Bathroom: "Badrum",
  Bed: "Sovplats",
  BedroomChild: "Barnrum",
  BedroomParent: "Sovrum",
  Bike: "Cykel",
  Bolt: "El",
  Building2: "Lagenhet",
  Building2Icon: "Lagenhet",
  Bus: "Buss",
  Car: "Bil",
  Cat: "Husdjur",
  Contract: "Avtal",
  CookingPot: "Matlagning",
  Cottage: "Stuga",
  Countertops: "Koksyta",
  Deck: "Uteplats",
  Dishwasher: "Diskmaskin",
  Domain: "Fastighet",
  DoorFront: "Egen ingang",
  Elevator: "Hiss",
  EvStation: "Laddplats",
  FaFacebook: "Facebook",
  FaInstagram: "Instagram",
  FaLinkedin: "LinkedIn",
  FaTiktok: "TikTok",
  FaYoutube: "YouTube",
  Fence: "Tomt",
  FitnessCenter: "Gym",
  Floor: "Vaningsplan",
  Foundation: "Grund",
  Garage: "Garage",
  GraduationCap: "Student",
  GraduationCapIcon: "Student",
  Grass: "Tradgard",
  Grocery: "Matbutik",
  HeatPump: "Varmepump",
  HolidayVillage: "Bostadsomrade",
  Home: "Hem",
  HomeIcon: "Hem",
  House: "Hus",
  HouseShield: "Tryggt boende",
  Kitchen: "Kok",
  Lightbulb: "Belysning",
  LocalCafe: "Cafe",
  MapPin: "Plats",
  MapPinIcon: "Plats",
  Parking: "Parkering",
  Payments: "Hyra",
  RealEstateAgent: "Hyresvard",
  Restaurant: "Restaurang",
  Roofing: "Tak",
  SchoolIcon: "Skola",
  Shower: "Dusch",
  SiThreads: "Threads",
  Sofa: "Moblerat",
  Stairs: "Trappor",
  Storefront: "Butik",
  Subway: "Tunnelbana",
  Thermostat: "Varme",
  Train: "Tag",
  Tram: "Sparvagn",
  Twitter: "X",
  Villa: "Villa",
  WashingMachine: "Tvatt",
  WaterDrop: "Vatten",
  Wc: "WC",
  Wifi: "Internet",
  WorkspacePremium: "Premium",
};

const CATEGORY_BY_NAME: Record<string, AppIconCategory> = {
  apartment: "Bostadstyper",
  cottage: "Bostadstyper",
  domain: "Bostadstyper",
  home: "Bostadstyper",
  house: "Bostadstyper",
  "holiday-village": "Bostadstyper",
  villa: "Bostadstyper",

  bath: "Rum & ytor",
  bathroom: "Rum & ytor",
  bed: "Rum & ytor",
  "bedroom-child": "Rum & ytor",
  "bedroom-parent": "Rum & ytor",
  chair: "Rum & ytor",
  countertops: "Rum & ytor",
  deck: "Rum & ytor",
  "door-front": "Rum & ytor",
  floor: "Rum & ytor",
  foundation: "Rum & ytor",
  kitchen: "Rum & ytor",
  roofing: "Rum & ytor",
  ruler: "Rum & ytor",
  shower: "Rum & ytor",
  sofa: "Rum & ytor",
  straighten: "Rum & ytor",
  wc: "Rum & ytor",

  accessible: "Bekvämligheter",
  activity: "Bekvämligheter",
  balcony: "Bekvämligheter",
  bolt: "Bekvämligheter",
  car: "Bekvämligheter",
  cat: "Bekvämligheter",
  "cooking-pot": "Bekvämligheter",
  dishwasher: "Bekvämligheter",
  elevator: "Bekvämligheter",
  "ev-station": "Bekvämligheter",
  fence: "Bekvämligheter",
  garage: "Bekvämligheter",
  grass: "Bekvämligheter",
  "heat-pump": "Bekvämligheter",
  lightbulb: "Bekvämligheter",
  parking: "Bekvämligheter",
  stairs: "Bekvämligheter",
  thermostat: "Bekvämligheter",
  "washing-machine": "Bekvämligheter",
  "water-drop": "Bekvämligheter",
  wifi: "Bekvämligheter",

  bike: "Läge & närhet",
  bus: "Läge & närhet",
  "fitness-center": "Läge & närhet",
  "graduation-cap": "Läge & närhet",
  grocery: "Läge & närhet",
  "local-cafe": "Läge & närhet",
  map: "Läge & närhet",
  "map-pin": "Läge & närhet",
  restaurant: "Läge & närhet",
  school: "Läge & närhet",
  storefront: "Läge & närhet",
  subway: "Läge & närhet",
  train: "Läge & närhet",
  tram: "Läge & närhet",

  contract: "Hyra & villkor",
  "house-shield": "Hyra & villkor",
  "key-round": "Hyra & villkor",
  payments: "Hyra & villkor",
  "real-estate-agent": "Hyra & villkor",
  "shield-check": "Hyra & villkor",
  verified: "Hyra & villkor",
  "workspace-premium": "Hyra & villkor",

  "ads-click": "Plattform",
  bell: "Plattform",
  "calendar-days": "Plattform",
  checklist: "Plattform",
  favorite: "Plattform",
  heart: "Plattform",
  image: "Plattform",
  "image-plus": "Plattform",
  search: "Plattform",
  settings: "Plattform",
  tag: "Plattform",
  users: "Plattform",

  facebook: "Sociala medier",
  instagram: "Sociala medier",
  linkedin: "Sociala medier",
  threads: "Sociala medier",
  tiktok: "Sociala medier",
  x: "Sociala medier",
  youtube: "Sociala medier",

  "arrow-down": "Navigation",
  "arrow-down-right": "Navigation",
  "arrow-left": "Navigation",
  "arrow-right": "Navigation",
  "arrow-up": "Navigation",
  "arrow-up-right": "Navigation",
  "chevron-down": "Navigation",
  "chevron-left": "Navigation",
  "chevron-right": "Navigation",
  "chevron-up": "Navigation",
  close: "Navigation",
  "external-link": "Navigation",
  menu: "Navigation",
  "more-horizontal": "Navigation",
  move: "Navigation",
  "open-in-new": "Navigation",
  "rotate-ccw": "Navigation",
  "unfold-more": "Navigation",

  "alert-triangle": "Status",
  "badge-check": "Status",
  check: "Status",
  "check-circle": "Status",
  "circle-check": "Status",
  "circle-pause": "Status",
  "circle-question-mark": "Status",
  "help-circle": "Status",
  info: "Status",
  loader: "Status",
  "octagon-x": "Status",
  "triangle-alert": "Status",
  "x-circle": "Status",

  call: "Kommunikation",
  globe: "Kommunikation",
  mail: "Kommunikation",
  phone: "Kommunikation",
  public: "Kommunikation",
  share2: "Kommunikation",
  smartphone: "Kommunikation",

  "add-photo-alternate": "Media",
  file: "Media",
  "file-check2": "Media",
  "file-spreadsheet": "Media",
  "file-text": "Media",
  newspaper: "Media",
  "play-circle": "Media",
  quote: "Media",
  video: "Media",

  add: "Admin",
  copy: "Admin",
  delete: "Admin",
  download: "Admin",
  edit: "Admin",
  pencil: "Admin",
  "pencil-line": "Admin",
  plus: "Admin",
  "refresh-cw": "Admin",
  save: "Admin",
  trash: "Admin",
  upload: "Admin",
  "upload-cloud": "Admin",

  "bar-chart": "Data",
  dns: "Data",
  list: "Data",
  "list-checks": "Data",
  percent: "Data",
  schedule: "Data",
  server: "Data",
  "table-chart": "Data",
  task: "Data",
  "trending-up": "Data",
};

const EXTRA_KEYWORDS: Record<string, string[]> = {
  accessible: ["tillganglighet", "rullstol", "anpassat", "accessibility"],
  activity: ["aktivitet", "event", "lokal aktivitet"],
  apartment: ["lagenhet", "building", "byggnad", "bostad", "apartment"],
  balcony: ["balkong", "uteplats", "terrass"],
  bath: ["badkar", "bad", "bath"],
  bathroom: ["badrum", "bathroom"],
  bed: ["sang", "sovplats", "rum", "studentrum", "bed"],
  "bedroom-child": ["barnrum", "extra rum"],
  "bedroom-parent": ["sovrum", "master bedroom"],
  bike: ["cykel", "cykelrum", "bike"],
  bolt: ["el", "strom", "electricity"],
  bus: ["buss", "kollektivtrafik", "pendla"],
  car: ["bil", "parking", "parkering"],
  cat: ["pets", "pet", "husdjur", "djur"],
  contract: ["avtal", "kontrakt", "hyresavtal", "contract"],
  "cooking-pot": ["kitchen", "kok", "matlagning"],
  cottage: ["stuga", "cottage", "fritidshus"],
  countertops: ["koksyta", "bank", "arbetsbank", "countertop"],
  deck: ["uteplats", "altan", "terrass", "patio"],
  dishwasher: ["diskmaskin", "dishwasher"],
  domain: ["fastighet", "byggnad", "foretag", "property"],
  "door-front": ["egen ingang", "dorr", "entrance", "private entrance"],
  elevator: ["hiss", "elevator", "lift"],
  "ev-station": ["laddplats", "elbil", "ev", "charging"],
  facebook: ["social", "social media"],
  fence: ["tomt", "staket", "inhagnad"],
  "fitness-center": ["gym", "traning", "fitness"],
  floor: ["vaning", "vaningsplan", "floor"],
  foundation: ["grund", "byggnad", "foundation"],
  garage: ["garage", "parkering", "bilplats"],
  "graduation-cap": ["student", "skola", "universitet", "education"],
  grass: ["tradgard", "garden", "yard", "gron yta"],
  grocery: ["matbutik", "livsmedel", "butik", "grocery"],
  "heat-pump": ["varmepump", "varme", "heat"],
  "holiday-village": ["bostadsomrade", "studentboende", "dorm", "korridor"],
  home: ["hem", "bostad", "hus"],
  house: ["hus", "villa", "radhus", "townhouse"],
  "house-shield": ["tryggt boende", "sakerhet", "forsakring", "verified housing"],
  instagram: ["social", "social media"],
  kitchen: ["kok", "kitchen", "matlagning"],
  lightbulb: ["belysning", "lampa", "ljus"],
  linkedin: ["social", "social media"],
  "local-cafe": ["cafe", "kaffe", "nearby"],
  "map-pin": ["plats", "adress", "location", "position"],
  parking: ["parkering", "bilplats", "parking"],
  payments: ["hyra", "pris", "kostnad", "rent", "payment"],
  "real-estate-agent": ["hyresvard", "maklare", "landlord", "agent"],
  restaurant: ["restaurang", "mat", "food"],
  roofing: ["tak", "vind", "attic"],
  schedule: ["tid", "datum", "kalender", "time"],
  "shield-check": ["verifierad", "verified", "trygg"],
  shower: ["dusch", "badrum", "shower"],
  sofa: ["moblerad", "furnished", "furniture"],
  sparkles: ["featured", "utvald"],
  stairs: ["trappa", "trappor", "stairs"],
  storefront: ["butik", "service", "centrum"],
  subway: ["tunnelbana", "metro", "kollektivtrafik"],
  thermostat: ["varme", "temperatur", "heating"],
  threads: ["social", "social media"],
  tiktok: ["social", "social media"],
  train: ["tag", "pendel", "station", "train"],
  tram: ["sparvagn", "tram", "kollektivtrafik"],
  villa: ["villa", "hus", "radhus"],
  "washing-machine": ["tvatt", "laundry", "tvattstuga"],
  "water-drop": ["vatten", "water"],
  wc: ["wc", "toalett", "toilet"],
  wifi: ["internet", "internet included", "bredband"],
  "workspace-premium": ["premium", "utvald", "forstahand", "quality"],
  x: ["twitter", "social", "social media"],
  youtube: ["social", "social media", "video"],
};

const ICON_ALIASES: Record<string, string> = {
  altan: "deck",
  apartment: "apartment",
  balcony: "balcony",
  balkong: "balcony",
  bathroom: "bathroom",
  badrum: "bathroom",
  bed: "bed",
  boende: "home",
  "corridor-room": "holiday-village",
  corridor_room: "holiday-village",
  diskmaskin: "dishwasher",
  dishwasher: "dishwasher",
  elevator: "elevator",
  "egen-ingang": "door-front",
  furnished: "sofa",
  garden: "grass",
  gym: "fitness-center",
  hiss: "elevator",
  house: "house",
  hus: "house",
  lagenhet: "apartment",
  laundry: "washing-machine",
  "laundry-room": "washing-machine",
  moblerad: "sofa",
  internet: "wifi",
  "internet-included": "wifi",
  parking: "parking",
  parkering: "parking",
  "pet-friendly": "cat",
  "pets-allowed": "cat",
  husdjur: "cat",
  room: "bed",
  rum: "bed",
  "shared-room": "bedroom-parent",
  "student-room": "bed",
  studentrum: "bed",
  stuga: "cottage",
  townhouse: "house",
  tradgard: "grass",
  "free-of-points": "verified",
  poangfri: "verified",
  villa: "villa",
  twitter: "x",
};

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function toKebabCase(value: string) {
  return stripDiacritics(value)
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[@:/_.\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function normalizeIconName(value: string | null | undefined) {
  if (!value) return "";

  return toKebabCase(value)
    .replace(/^icon-/, "")
    .replace(/^fa-/, "")
    .replace(/^si-/, "")
    .replace(/^material-symbols-/, "")
    .replace(/^simple-icons-/, "")
    .replace(/-rounded$/, "")
    .replace(/-sharp$/, "")
    .replace(/-outline$/, "")
    .replace(/-icon$/, "");
}

function humanizeIconName(value: string) {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^(Fa|Si|Icon)\s+/, "")
    .replace(/\s+Icon$/, "")
    .trim();
}

function isAppIcon(value: unknown): value is AppIcon {
  return Boolean(value) && (typeof value === "function" || typeof value === "object");
}

function exportPreferenceScore(exportName: string) {
  let score = 0;
  if (exportName.endsWith("Icon")) score += 4;
  if (/^(Fa|Si|Icon)/.test(exportName)) score += 2;
  if (/\d/.test(exportName)) score += 1;
  return score;
}

function categoryFor(name: string): AppIconCategory {
  return CATEGORY_BY_NAME[name] ?? "Ovrigt";
}

function buildOption(exportName: string, Icon: AppIcon): AppIconOption & { score: number } {
  const name = ICON_NAME_BY_EXPORT[exportName] ?? normalizeIconName(exportName);
  const label = ICON_LABEL_BY_EXPORT[exportName] ?? humanizeIconName(exportName);
  const category = categoryFor(name);
  const keywords = [
    ...new Set([
      name,
      exportName,
      label,
      category,
      ...name.split("-"),
      ...(EXTRA_KEYWORDS[name] ?? []),
    ]),
  ];
  const searchText = keywords.map(normalizeIconName).join(" ");

  return {
    name,
    exportName,
    label,
    category,
    keywords,
    Icon,
    searchText,
    score: exportPreferenceScore(exportName),
  };
}

function createIconOptions() {
  const byName = new Map<string, AppIconOption & { score: number }>();

  Object.entries(AppIcons).forEach(([exportName, value]) => {
    if (!isAppIcon(value)) return;

    const option = buildOption(exportName, value);
    const existing = byName.get(option.name);

    if (!existing || option.score < existing.score) {
      byName.set(option.name, option);
    }
  });

  return Array.from(byName.values())
    .map(({ score: _score, ...option }) => option)
    .sort((left, right) => {
      const categoryDelta =
        APP_ICON_CATEGORIES.indexOf(left.category) - APP_ICON_CATEGORIES.indexOf(right.category);
      if (categoryDelta !== 0) return categoryDelta;
      return left.label.localeCompare(right.label, "sv", { sensitivity: "base" });
    });
}

export const APP_ICON_OPTIONS: AppIconOption[] = createIconOptions();

const ICON_OPTION_BY_KEY = (() => {
  const map = new Map<string, AppIconOption>();

  APP_ICON_OPTIONS.forEach((option) => {
    [
      option.name,
      option.exportName,
      option.label,
      ...option.keywords,
      option.exportName.replace(/Icon$/, ""),
    ].forEach((key) => {
      const normalizedKey = normalizeIconName(key);
      if (normalizedKey) {
        map.set(normalizedKey, option);
      }
    });
  });

  Object.entries(ICON_ALIASES).forEach(([alias, target]) => {
    const targetOption = map.get(normalizeIconName(target));
    if (targetOption) {
      map.set(normalizeIconName(alias), targetOption);
    }
  });

  return map;
})();

export function getAppIconOption(name: string | null | undefined) {
  const normalizedName = normalizeIconName(name);
  if (!normalizedName) return null;
  return ICON_OPTION_BY_KEY.get(normalizedName) ?? null;
}

export function getAppIconComponent(name: string | null | undefined) {
  return getAppIconOption(name)?.Icon ?? null;
}

export function getAppIconElement(
  name: string | null | undefined,
  className?: string,
  props?: Omit<AppIconProps, "className">
) {
  const Icon = getAppIconComponent(name);
  return Icon ? <Icon className={className} {...props} /> : null;
}

export function filterAppIconOptions(query: string, category: AppIconCategory | "all") {
  const normalizedQuery = normalizeIconName(query);
  const queryParts = normalizedQuery.split("-").filter(Boolean);

  return APP_ICON_OPTIONS.filter((option) => {
    if (category !== "all" && option.category !== category) return false;
    if (queryParts.length === 0) return true;
    return queryParts.every((part) => option.searchText.includes(part));
  });
}

export function TagIcon({
  name,
  className,
  fallback = null,
  ...props
}: Omit<AppIconProps, "name"> & {
  name: string | null | undefined;
  fallback?: React.ReactNode;
}) {
  const Icon = getAppIconComponent(name);
  return Icon ? <Icon className={className} {...props} /> : <>{fallback}</>;
}


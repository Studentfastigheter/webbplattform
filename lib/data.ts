import { faker } from "@faker-js/faker";
import {
  Box,
  Users,
  Home,
  Megaphone,
  AlertTriangle,
  Eye,
  type LucideIcon,
} from "lucide-react";

export type Ad = {
  id: number;
  address: string;
  rooms: number | null;
  rent: number | null;
  status: string;
  published: string;
};

export const createAds = (numberOfAds: number) => {
  const ads: Ad[] = []
  for (let i = 0; i < numberOfAds; i++) {
    ads.push({
      id: i,
      address: faker.location.streetAddress(),
      rooms: Math.floor(Math.random() * (5 - 1)) + 1,
      rent: Math.floor(Math.random() * (11000 - 4000)) + 4000,
      status: Math.floor(Math.random() * 2) == 1 ? "ledig" : "uthyrd",
      published: faker.date.recent().toISOString()
    })
  }
  return ads;
}




type StatisticConfig = {
  id: string;
  label: string;
  data: number;
  change: number;
  positive_rate_of_change: "up" | "down";
  icon: LucideIcon;
};

export const ORGANISATION_DASHBOARD_STATISTICS: StatisticConfig[] = [
  {
    ["id"]: "objects",
    ["label"]: "Antal objekt",
    ["data"]: 40,
    ["change"]: 0.034,
    ["positive_rate_of_change"]: "up",
    icon: Box,
  },
  {
    ["id"]: "renters",
    ["label"]: "Hyresgäster",
    ["data"]: 234,
    ["change"]: -0.07,
    ["positive_rate_of_change"]: "up",
    icon: Users,
  },
  {
    ["id"]: "available_objects",
    ["label"]: "Lediga bostäder",
    ["data"]: 12,
    ["change"]: -0.035,
    ["positive_rate_of_change"]: "down",
    icon: Home,
  },
  {
    ["id"]: "active_ads",
    ["label"]: "Aktiva annonser",
    ["data"]: 4,
    ["change"]: 2.4,
    ["positive_rate_of_change"]: "up",
    icon: Megaphone,
  },
  {
    ["id"]: "complaint",
    ["label"]: "Felanmälningar",
    ["data"]: 6,
    ["change"]: -2.4,
    ["positive_rate_of_change"]: "down",
    icon: AlertTriangle,
  },
  {
    ["id"]: "views",
    ["label"]: "Visningar idag",
    ["data"]: 1352,
    ["change"]: 2.4,
    ["positive_rate_of_change"]: "up",
    icon: Eye,
  },
]
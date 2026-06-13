import { KeyRound, Search, UserPlus } from "@/components/icons";

import type { Dictionary } from "@/i18n/dictionaries";

const stepIcons = [UserPlus, Search, KeyRound];

export function getHomePageData(dictionary: Dictionary) {
  return {
    stickyCardsData: dictionary.home.stickyCards.items.map((card) => ({
      ...card,
      img: "",
    })),
    stepsData: dictionary.home.steps.items.map((step, index) => ({
      ...step,
      icon: stepIcons[index] ?? UserPlus,
    })),
    featuresData: dictionary.home.features.items.map((feature) => ({
      ...feature,
      color: "bg-primary",
      img: "",
    })),
  };
}

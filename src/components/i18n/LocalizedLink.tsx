"use client";

import Link, { type LinkProps } from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { useI18n } from "@/i18n/I18nProvider";

type LocalizedLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
  href: LinkProps["href"];
};

export function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const { localizedHref } = useI18n();
  const localized = typeof href === "string" ? localizedHref(href) : href;

  return <Link href={localized} {...props} />;
}

import { redirect } from "next/navigation";
import { localizeHref } from "@/i18n/config";
import { getRequestLocale } from "@/i18n/server";

export default async function FrejaIdLoginPage() {
  const locale = await getRequestLocale();
  redirect(localizeHref("/registrera/freja-id?start=freja", locale));
}

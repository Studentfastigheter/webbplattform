"use client";

import Link from "next/link";
import type { CompanyPublicDTO } from "@/features/companies/services/company-service";
import CompanyLogo from "@/components/shared/CompanyLogo";
import { RichTextParagraph } from "@/components/ui/RichText";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const getCompanyWebsiteUrl = (company: CompanyPublicDTO) => {
  const rawUrl = company.websiteUrl?.trim() || company.website?.trim() || "";
  if (!rawUrl) return null;

  return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
};

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

export default function SimpleCompanyCard({
  company,
  description: descriptionOverride,
  href,
  size = "default",
}: {
  company: CompanyPublicDTO;
  description?: string | null;
  href?: string | null;
  size?: "default" | "compact";
}) {
  const { locale } = useI18n();
  const websiteUrl = getCompanyWebsiteUrl(company);
  const cardHref = href?.trim() || websiteUrl;
  const description =
    descriptionOverride?.trim() ||
    company.description?.trim() ||
    company.subtitle?.trim() ||
    localizedText(locale, "Läs mer om företaget på deras hemsida.", "Read more about the company on its website.");
  const logoUrl = company.logoUrl?.trim() || "";
  const isCompact = size === "compact";
  const descriptionLineClamp = 2;
  const className = isCompact
    ? "group/card relative flex h-full w-full max-w-none flex-col gap-3 overflow-hidden rounded-lg border border-black/[0.05] bg-card px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-200 hover:border-[#004225]/15 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] sm:px-5 sm:py-4"
    : "group/card relative flex h-full min-h-80 w-full max-w-none flex-col rounded-lg border border-black/[0.05] bg-card px-7 pb-7 pt-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-200 hover:border-[#004225]/15 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225]";

  const compactContent = (
    <div className="grid h-full min-w-0 grid-cols-[92px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
      <div className="flex h-20 items-center justify-center border-r border-black/[0.04] pr-3 sm:h-24 sm:pr-4">
        <CompanyLogo
          src={logoUrl || null}
          alt={localizedText(locale, `${company.name} logotyp`, `${company.name} logo`)}
          name={company.name || localizedText(locale, "Företag", "Company")}
          className="h-20 w-20 rounded-2xl bg-white ring-0 sm:h-24 sm:w-24"
          imageClassName="p-0"
        />
      </div>

      <div className="flex min-w-0 flex-col items-start gap-2 sm:text-left">
        <div className="flex min-w-0 flex-col items-start gap-1">
          <div className="flex min-h-[28px] min-w-0 items-start justify-start overflow-hidden">
            <h3
              className="w-full truncate text-[17px] font-normal leading-[23px] text-[#111111] sm:text-[18px]"
              title={company.name}
            >
              {company.name}
            </h3>
          </div>

          {description && (
            <RichTextParagraph
              text={description}
              className="min-h-[38px] shrink-0 text-left text-[14px] font-normal leading-[19px] text-[#202020]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: descriptionLineClamp,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const defaultContent = (
    <>
      <div className="flex h-32 shrink-0 items-center justify-center overflow-visible py-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={localizedText(locale, `${company.name} logotyp`, `${company.name} logo`)}
            className="block h-auto max-h-20 w-auto max-w-[84%] object-contain"
          />
        ) : (
          <span className="text-xl font-bold text-muted-foreground/60">
            {company.name || localizedText(locale, "Företag", "Company")}
          </span>
        )}
      </div>

      <div className="mt-8 flex min-h-0 flex-1 flex-col">
        <h3
          className="text-xl font-bold leading-tight text-foreground"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {company.name}
        </h3>

        {description && (
          <RichTextParagraph
            text={description}
            className="mt-4 text-sm leading-6 text-muted-foreground"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: descriptionLineClamp,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
          />
        )}
      </div>
    </>
  );
  const content = isCompact ? compactContent : defaultContent;

  if (!cardHref) {
    return <article className={className}>{content}</article>;
  }

  if (!isExternalHref(cardHref)) {
    return (
      <Link href={cardHref} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={cardHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  );
}

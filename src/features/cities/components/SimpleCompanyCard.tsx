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
    ? "group/card relative flex h-full min-h-[6.25rem] w-full max-w-none flex-col gap-3 overflow-hidden rounded-lg border border-black/[0.05] bg-card px-3 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-200 hover:border-[#004225]/15 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] sm:min-h-0 sm:px-5 sm:py-4"
    : "group/card relative flex h-full min-h-[18rem] w-full max-w-none flex-col rounded-lg border border-black/[0.05] bg-card p-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-200 hover:border-[#004225]/15 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004225] sm:min-h-80 sm:p-6 lg:p-7";

  const compactContent = (
    <div className="grid h-full min-w-0 grid-cols-[76px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
      <div className="flex h-16 items-center justify-center border-r border-black/[0.04] pr-3 sm:h-24 sm:pr-4">
        <CompanyLogo
          src={logoUrl || null}
          alt={localizedText(locale, `${company.name} logotyp`, `${company.name} logo`)}
          name={company.name || localizedText(locale, "Företag", "Company")}
          className="h-14 w-14 rounded-xl bg-white ring-0 sm:h-24 sm:w-24 sm:rounded-2xl"
          imageClassName="p-1.5 sm:p-0"
        />
      </div>

      <div className="flex min-w-0 flex-col items-start gap-2 sm:text-left">
        <div className="flex min-w-0 flex-col items-start gap-1">
          <div className="flex min-h-[28px] min-w-0 items-start justify-start overflow-hidden">
            <h3
              className="w-full truncate text-[15px] font-normal leading-5 text-[#111111] sm:text-[18px] sm:leading-[23px]"
              title={company.name}
            >
              {company.name}
            </h3>
          </div>

          {description && (
            <RichTextParagraph
              text={description}
              className="min-h-[34px] shrink-0 text-left text-[13px] font-normal leading-[17px] text-[#202020] sm:min-h-[38px] sm:text-[14px] sm:leading-[19px]"
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
      <div className="flex h-24 shrink-0 items-center justify-center overflow-hidden px-3 sm:h-28 sm:px-4 lg:h-32">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={localizedText(locale, `${company.name} logotyp`, `${company.name} logo`)}
            className="block max-w-full object-contain"
            style={{
              height: "100%",
              width: "auto",
              objectPosition: "center",
            }}
          />
        ) : (
          <span className="text-xl font-bold text-muted-foreground/60">
            {company.name || localizedText(locale, "Företag", "Company")}
          </span>
        )}
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col sm:mt-6">
        <h3
          className="text-lg font-bold leading-tight text-foreground sm:text-xl"
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

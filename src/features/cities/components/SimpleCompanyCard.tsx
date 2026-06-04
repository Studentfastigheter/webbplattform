import type { CompanyPublicDTO } from "@/features/companies/services/company-service";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

const getCompanyWebsiteUrl = (company: CompanyPublicDTO) => {
  const rawUrl = company.websiteUrl?.trim() || company.website?.trim() || "";
  if (!rawUrl) return null;

  return /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
};

export default function SimpleCompanyCard({
  company,
}: {
  company: CompanyPublicDTO;
}) {
  const { locale } = useI18n();
  const websiteUrl = getCompanyWebsiteUrl(company);
  const description =
    company.description?.trim() ||
    company.subtitle?.trim() ||
    localizedText(locale, "Läs mer om företaget på deras hemsida.", "Read more about the company on its website.");

  const content = (
    <>
      <div className="flex w-[108px] shrink-0 self-stretch items-center justify-center bg-white p-1 sm:w-[120px]">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={localizedText(locale, `${company.name} logotyp`, `${company.name} logo`)}
            className="h-full max-h-[118px] w-full object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xl font-semibold text-gray-500">
            {company.name.trim().charAt(0).toUpperCase() || localizedText(locale, "F", "C")}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-start px-3.5 py-4 sm:px-4 sm:py-5">
        <h3
          className="text-[17px] font-semibold leading-[21px] text-[#111111] sm:text-lg sm:leading-6"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
          }}
        >
          {company.name}
        </h3>
        <p
          className="mt-1.5 text-left text-[13px] leading-[18px] text-[#202020] sm:text-[13.5px] sm:leading-[19px]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
          }}
        >
          {description}
        </p>
        {websiteUrl && (
          <span className="mt-auto truncate pt-2 text-xs font-semibold text-[#004225]">
            {websiteUrl.replace(/^https?:\/\//i, "")}
          </span>
        )}
      </div>
    </>
  );

  const className =
    "flex h-full min-h-[142px] w-full overflow-hidden rounded-lg border border-black/[0.04] bg-white shadow-[0_10px_26px_rgba(17,24,39,0.06)] transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(17,24,39,0.09)] sm:min-h-[150px]";

  if (!websiteUrl) {
    return <article className={className}>{content}</article>;
  }

  return (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  );
}

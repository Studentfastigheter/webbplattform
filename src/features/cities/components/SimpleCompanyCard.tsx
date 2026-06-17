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
      <div className="grid shrink-0 gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start sm:gap-4 md:grid-cols-[124px_minmax(0,1fr)]">
        <div className="flex h-20 items-center justify-center border-black/[0.04] sm:h-24 sm:border-r sm:pr-4">
          <CompanyLogo
            src={company.logoUrl}
            alt={localizedText(locale, `${company.name} logotyp`, `${company.name} logo`)}
            name={company.name || localizedText(locale, "Företag", "Company")}
            className="h-20 w-20 rounded-2xl bg-white ring-0 sm:h-24 sm:w-24"
            imageClassName="p-0"
          />
        </div>

        <div className="flex min-w-0 flex-col items-start gap-2 pt-3 sm:pt-4 sm:text-left">
          <div className="flex min-w-0 flex-col items-start gap-1">
            <div className="flex min-h-[30px] min-w-0 flex-wrap items-start justify-start gap-2 overflow-hidden">
              <h3
                className="text-[18px] font-normal leading-[23px] text-[#111111]"
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
            </div>

            <RichTextParagraph
              text={description}
              className="min-h-[38px] shrink-0 text-left text-[14px] font-normal leading-[19px] text-[#202020]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
              }}
            />

            {websiteUrl && (
              <span className="min-h-[17px] max-w-full truncate text-[13px] font-medium leading-[17px] text-[#004225]">
                {websiteUrl.replace(/^https?:\/\//i, "")}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const className =
    "relative flex h-full min-h-[188px] w-full max-w-none flex-col gap-4 overflow-hidden rounded-[32px] border border-black/[0.04] bg-white px-4 pb-4 pt-4 shadow-md transition-shadow duration-200 hover:shadow-lg sm:min-h-[188px] sm:px-5 sm:pt-5";

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

import type { CompanyPublicDTO } from "@/features/companies/services/company-service";

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
  const websiteUrl = getCompanyWebsiteUrl(company);
  const description =
    company.description?.trim() ||
    company.subtitle?.trim() ||
    "Läs mer om företaget på deras hemsida.";

  const content = (
    <>
      <div className="flex h-14 w-20 shrink-0 items-center justify-center border-black/[0.04] sm:h-16 sm:w-24 sm:border-r sm:pr-4">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={`${company.name} logotyp`}
            className="max-h-12 w-full max-w-[88px] object-contain sm:max-h-14"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-base font-semibold text-gray-500">
            {company.name.trim().charAt(0).toUpperCase() || "F"}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate text-[16px] font-medium leading-5 text-[#111111]">
          {company.name}
        </h3>
        <p
          className="text-left text-[13px] leading-[18px] text-[#202020]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
          }}
        >
          {description}
        </p>
        {websiteUrl && (
          <span className="mt-1 truncate text-xs font-semibold text-[#004225]">
            {websiteUrl.replace(/^https?:\/\//i, "")}
          </span>
        )}
      </div>
    </>
  );

  const className =
    "flex h-full min-h-[132px] w-full items-center gap-3 overflow-hidden rounded-2xl border border-black/[0.04] bg-white px-4 py-4 shadow-md transition-shadow duration-200 hover:shadow-lg sm:min-h-[148px] sm:gap-4 sm:px-5";

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

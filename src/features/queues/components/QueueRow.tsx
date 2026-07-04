import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import CompanyLogo from "@/components/shared/CompanyLogo";
import type { ListFrameRow } from "@/components/layout/ListFrame";
import StatusTag, { type Status } from "@/components/ui/statusTag";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export type QueueRowProps = {
  id: string | number;
  name: string;
  logoUrl?: string | null;
  status: Status;
  days: number;
  companyProfileHref?: string | null;
  onLeave?: () => void;
  leaving?: boolean;
};

const NameCell: React.FC<
  Pick<QueueRowProps, "name" | "logoUrl"> & { compact?: boolean }
> = ({ name, logoUrl, compact = false }) => (
  <div className="flex min-w-0 items-center gap-3">
    <CompanyLogo
      src={logoUrl}
      alt={name}
      name={name}
      className={clsx(
        "flex-shrink-0 rounded-xl bg-transparent ring-0 shadow-none",
        compact ? "h-12 w-12" : "h-14 w-14"
      )}
      imageClassName="p-0"
      fallbackClassName="rounded-xl bg-gray-50 text-gray-500"
    />
    <div
      className={clsx(
        "min-w-0 text-[15px] font-semibold leading-5 text-gray-950",
        compact ? "break-words" : "truncate"
      )}
    >
      {name}
    </div>
  </div>
);

const StatusCell: React.FC<{ status: Status }> = ({ status }) => (
  <div className="flex min-h-11 items-center justify-center">
    <StatusTag
      status={status}
      height={24}
      horizontalPadding={12}
      className="text-[12px] font-medium"
    />
  </div>
);

const DaysCell: React.FC<{ days: number }> = ({ days }) => {
  const { locale } = useI18n();

  return (
    <div className="flex min-h-11 items-center text-left text-sm leading-5 text-gray-500">
      <span className="mr-1 text-[15px] font-semibold text-gray-950">{days}</span>
      {localizedText(locale, "dagar i kö", "days in queue")}
    </div>
  );
};

const ActionsCell: React.FC<
  Pick<QueueRowProps, "companyProfileHref" | "onLeave" | "leaving"> & {
    className?: string;
  }
> = ({
  companyProfileHref,
  onLeave,
  leaving = false,
  className,
}) => {
  const { locale } = useI18n();
  const label = localizedText(locale, "Visa företag", "View company");
  const leaveLabel = leaving
    ? localizedText(locale, "Lämnar…", "Leaving…")
    : localizedText(locale, "Lämna kö", "Leave queue");

  return (
    <div
      className={clsx(
        "flex min-h-11 flex-col items-center justify-center gap-1.5",
        className
      )}
    >
      {companyProfileHref ? (
        <Link
          href={companyProfileHref}
          className={clsx(
            "inline-flex items-center gap-1 text-[13px] font-semibold text-brand",
            "transition hover:text-[#00331d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          )}
        >
          {label}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className="inline-flex items-center text-[13px] font-semibold text-gray-400">
          {label}
        </span>
      )}

      {onLeave && (
        <button
          type="button"
          onClick={onLeave}
          disabled={leaving}
          className={clsx(
            "inline-flex items-center text-[13px] font-semibold text-red-600",
            "transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          )}
        >
          {leaveLabel}
        </button>
      )}
    </div>
  );
};

export const buildQueueRow = (props: QueueRowProps): ListFrameRow => {
  const { id, name, logoUrl, status, days, companyProfileHref, onLeave, leaving } =
    props;

  return {
    id,
    className: "items-center bg-white transition-colors hover:bg-[#F7FAF8]",
    cells: [
      <NameCell key={`${id}-name`} name={name} logoUrl={logoUrl} />,
      <StatusCell key={`${id}-status`} status={status} />,
      <DaysCell key={`${id}-days`} days={days} />,
      <ActionsCell
        key={`${id}-actions`}
        companyProfileHref={companyProfileHref}
        onLeave={onLeave}
        leaving={leaving}
      />,
    ],
  };
};

export const QueueCard: React.FC<QueueRowProps> = ({
  name,
  logoUrl,
  status,
  days,
  companyProfileHref,
  onLeave,
  leaving,
}) => {
  const { locale } = useI18n();

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <NameCell name={name} logoUrl={logoUrl} compact />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 px-3 py-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-normal text-gray-500">
            Status
          </div>
          <StatusTag
            status={status}
            height={24}
            horizontalPadding={12}
            className="text-[12px] font-medium"
          />
        </div>

        <div className="rounded-lg bg-gray-50 px-3 py-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-normal text-gray-500">
            {localizedText(locale, "Kötid", "Queue time")}
          </div>
          <div className="text-sm leading-5 text-gray-500">
            <span className="mr-1 text-[15px] font-semibold text-gray-950">
              {days}
            </span>
            {localizedText(locale, "dagar", "days")}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <ActionsCell
          companyProfileHref={companyProfileHref}
          onLeave={onLeave}
          leaving={leaving}
          className="min-h-0 flex-row items-center justify-start gap-4"
        />
      </div>
    </article>
  );
};

export default buildQueueRow;

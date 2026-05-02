import React from "react";
import clsx from "clsx";
import { ChevronRight, MapPin } from "lucide-react";
import type { ListFrameRow } from "../layout/ListFrame";
import Tag from "../ui/Tag";
import { Button } from "@/components/ui/button";
import StatusTag, { type Status } from "../ui/statusTag";

export type QueueRowProps = {
  id: string | number;
  name: string;
  logoUrl: string;
  cities: string[];
  status: Status;
  days: number;
  onManage?: () => void;
};

const NameCell: React.FC<Pick<QueueRowProps, "name" | "logoUrl">> = ({
  name,
  logoUrl,
}) => (
  <div className="flex min-w-0 items-center gap-3">
    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
      <img src={logoUrl} alt={name} className="h-full w-full object-contain" />
    </div>
    <div className="min-w-0 truncate text-[15px] font-semibold leading-5 text-gray-950">
      {name}
    </div>
  </div>
);

const CitiesCell: React.FC<{ cities: string[] }> = ({ cities }) => (
  <div className="flex min-h-11 items-center">
    {cities.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <Tag
            key={city}
            text={city}
            height={24}
            horizontalPadding={10}
            fontSize={12}
            fontWeight={500}
            className="border-gray-200 bg-gray-50 text-gray-700"
          />
        ))}
      </div>
    ) : (
      <div className="inline-flex items-center gap-1.5 text-sm text-gray-400">
        <MapPin className="h-3.5 w-3.5" />
        Ej angivet
      </div>
    )}
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

const DaysCell: React.FC<{ days: number }> = ({ days }) => (
  <div className="flex min-h-11 items-center text-left text-sm leading-5 text-gray-500">
    <span className="mr-1 text-[15px] font-semibold text-gray-950">{days}</span>
    dagar i kö
  </div>
);

const ActionsCell: React.FC<Pick<QueueRowProps, "onManage">> = ({
  onManage,
}) => (
  <div className="flex min-h-11 items-center justify-center">
    <Button
      type="button"
      onClick={onManage}
      className={clsx(
        "h-9 rounded-full border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-900 shadow-sm",
        "transition hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      Hantera
      <ChevronRight className="ml-1 h-3.5 w-3.5" />
    </Button>
  </div>
);

export const buildQueueRow = (props: QueueRowProps): ListFrameRow => {
  const { id, name, logoUrl, cities, status, days, onManage } = props;

  return {
    id,
    className: "items-center transition-colors hover:bg-gray-50/70",
    cells: [
      <NameCell key={`${id}-name`} name={name} logoUrl={logoUrl} />,
      <CitiesCell key={`${id}-cities`} cities={cities} />,
      <StatusCell key={`${id}-status`} status={status} />,
      <DaysCell key={`${id}-days`} days={days} />,
      <ActionsCell key={`${id}-actions`} onManage={onManage} />,
    ],
  };
};

export default buildQueueRow;

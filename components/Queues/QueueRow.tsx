import React from "react";
import clsx from "clsx";
import type { ListFrameRow } from "../layout/ListFrame";
import Tag from "../ui/Tag";
import { Button } from "@/components/ui/button";
import StatusTag, { type Status } from "../ui/statusTag";

export type QueueRowProps = {
  id: string | number;
  name: string;
  logoUrl: string;
  cities: string[];
  status: Status;          // ⬅️ samma typ som StatusTag
  days: number;
  onManage?: () => void;
};

const NameCell: React.FC<Pick<QueueRowProps, "name" | "logoUrl">> = ({ name, logoUrl }) => (
  <div className="flex items-center gap-3">
    <div className="h-[48px] w-[48px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
      <img src={logoUrl} alt={name} className="h-full w-full object-contain" />
    </div>
    <div className="text-[15px] font-semibold leading-5 text-black">{name}</div>
  </div>
);

const CitiesCell: React.FC<{ cities: string[] }> = ({ cities }) => (
  <div className="flex flex-wrap gap-2">
    {cities.map((city) => (
      <Tag
        key={city}
        text={city}
        bgColor="#F0F0F0"
        textColor="#000000"
        height={22}
        horizontalPadding={12}
        className="text-[12px] leading-[14px]"
      />
    ))}
  </div>
);

// 🔹 Tar emot status-strängen och skickar den rakt in i StatusTag
const StatusCell: React.FC<{ status: Status }> = ({ status }) => (
  <div className="flex justify-center">
    <StatusTag status={status} />
  </div>
);

const DaysCell: React.FC<{ days: number }> = ({ days }) => (
  <div className="text-sm text-left text-black">{days} dagar</div>
);

const ActionsCell: React.FC<Pick<QueueRowProps, "onManage">> = ({ onManage }) => (
  <div className="flex justify-center">
    <Button
      type="button"
      onClick={onManage}
      className={clsx(
        "h-9 w-[84px] rounded-full bg-[#D9D9D9] text-[12px] font-medium text-black",
        "transition hover:bg-[#cfcfcf]"
      )}
    >
      Hantera
    </Button>
  </div>
);

export const buildQueueRow = (props: QueueRowProps): ListFrameRow => {
  const { id, name, logoUrl, cities, status, days, onManage } = props;

  return {
    id,
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

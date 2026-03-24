import { Mail, MapPin, GraduationCap, Share2, Building2 } from "lucide-react";

import type { ListFrameRow } from "@/components/layout/ListFrame";
import { Button } from "@/components/ui/button";
import StatusTag, { type Status } from "@/components/ui/statusTag";
import type { DateString } from "@/types";

export type StudentApplicationRowProps = {
  applicationId: string;
  studentName: string;
  studentEmail?: string | null;
  studentCity?: string | null;
  studentProgram?: string | null;
  studentSchool?: string | null;
  listingTitle: string;
  listingCity?: string | null;
  status: Status;
  applicationDate: DateString;
  onOpen?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
};

const initialsFromName = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const buildStudentApplicationRow = (
  props: StudentApplicationRowProps
): ListFrameRow => {
  const {
    applicationId,
    studentName,
    studentEmail,
    studentCity,
    studentProgram,
    studentSchool,
    listingTitle,
    listingCity,
    status,
    applicationDate,
    onOpen,
    onMessage,
    onShare,
  } = props;

  const avatarLetters = initialsFromName(studentName || "S");
  const locationLabel = [listingCity].filter(Boolean).join(", ") || "-";

  const studentCell = (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start gap-3 text-left transition hover:opacity-95"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
        {avatarLetters || "S"}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="text-[15px] font-semibold leading-[18px] text-black">
          {studentName}
        </div>
        {studentEmail && (
          <div className="text-[12px] text-gray-600">{studentEmail}</div>
        )}
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-gray-700">
          {studentProgram && (
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              {studentProgram}
            </span>
          )}
          {studentSchool && (
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {studentSchool}
            </span>
          )}
          {studentCity && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {studentCity}
            </span>
          )}
        </div>
      </div>
    </button>
  );

  const listingCell = (
    <div className="flex h-full flex-col justify-center">
      <div className="text-[15px] font-semibold leading-[18px] text-black">
        {listingTitle}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[12px] leading-[14px] text-[#5b5b5b]">
        <MapPin className="h-3.5 w-3.5" />
        {locationLabel}
      </div>
    </div>
  );

  const statusCell = (
    <div className="flex justify-center">
      <StatusTag status={status} />
    </div>
  );

  const dateCell = (
    <div className="text-sm text-left text-black">{applicationDate}</div>
  );

  const actionsCell = (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onMessage}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CFCFCF] bg-white text-black transition hover:bg-[#f5f5f5]"
        >
          <Mail className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CFCFCF] bg-white text-black transition hover:bg-[#f5f5f5]"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
      <Button
        type="button"
        onClick={onOpen}
        className="h-9 w-[110px] rounded-full bg-[#D9D9D9] text-[12px] font-medium text-black transition hover:bg-[#cfcfcf]"
      >
        Se ansokan
      </Button>
    </div>
  );

  return {
    id: applicationId,
    cells: [studentCell, listingCell, statusCell, dateCell, actionsCell],
  };
};

export default buildStudentApplicationRow;

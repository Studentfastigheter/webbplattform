import { ChevronRight, Mail, MapPin, GraduationCap, Share2, Building2 } from "lucide-react";

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
      className="flex min-w-0 items-center gap-3 text-left transition hover:opacity-95"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800">
        {avatarLetters || "S"}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[15px] font-semibold leading-5 text-gray-950">
          {studentName}
        </div>
        {studentEmail && (
          <div className="mt-0.5 truncate text-xs text-gray-500">{studentEmail}</div>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
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
    <div className="flex min-h-14 flex-col justify-center">
      <div className="truncate text-[15px] font-semibold leading-5 text-gray-950">
        {listingTitle}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs leading-4 text-gray-500">
        <MapPin className="h-3.5 w-3.5" />
        {locationLabel}
      </div>
    </div>
  );

  const statusCell = (
    <div className="flex min-h-14 items-center justify-center">
      <StatusTag
        status={status}
        height={24}
        horizontalPadding={12}
        className="text-[12px] font-medium"
      />
    </div>
  );

  const dateCell = (
    <div className="flex min-h-14 items-center text-left text-sm text-gray-700">
      {applicationDate}
    </div>
  );

  const actionsCell = (
    <div className="flex min-h-14 flex-col items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onMessage}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          <Mail className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
      <Button
        type="button"
        onClick={onOpen}
        className="h-9 rounded-full border border-gray-200 bg-white px-3 text-[12px] font-medium text-gray-900 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
      >
        Se ansökan
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return {
    id: applicationId,
    className: "items-center transition-colors hover:bg-gray-50/70",
    cells: [studentCell, listingCell, statusCell, dateCell, actionsCell],
  };
};

export default buildStudentApplicationRow;

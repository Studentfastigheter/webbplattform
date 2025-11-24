import Tag from "./Tag";

export type Status = "Antagen" | "Under granskning" | "Nekad" | "Aktiv" | "Inaktiv" | "Bearbetas";

type StatusTagProps = {
  status: Status;
  bgColorOverride?: string;
  textColor?: string;
  height?: number;
  horizontalPadding?: number;
  width?: number | string;
  className?: string;
};

const colorMap: Record<Status, string> = {
  Antagen: "#008000",
  Aktiv: "#008000",
  "Under granskning": "#FFD32C",
  Bearbetas: "#FFD32C",
  Nekad: "#FF3333",
  Inaktiv: "#FF3333",
};

export default function StatusTag(props: StatusTagProps) {
  const {
    status,
    bgColorOverride,
    textColor = "#FFFFFF",
    height = 20,
    horizontalPadding = 10,
    width,
    className = "",
  } = props;

  const bgColor = bgColorOverride ?? colorMap[status];

  return (
    <Tag
      text={status}
      bgColor={bgColor}
      textColor={textColor}
      height={height}
      horizontalPadding={horizontalPadding}
      className={className}
      width={width}
    />
  );
}

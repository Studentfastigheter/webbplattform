import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type TagProps = {
  text: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  dotColor?: string;
  showDot?: boolean;
  height?: number;
  horizontalPadding?: number;
  width?: number | string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: CSSProperties["fontWeight"];
  className?: string;
};

export default function Tag({
  text,
  bgColor,
  textColor,
  borderColor,
  dotColor,
  showDot,
  height = 25,
  horizontalPadding = 16,
  width,
  fontSize = 14,
  lineHeight,
  fontWeight = 600,
  className = "",
}: TagProps) {
  const hasCustomColors = Boolean(bgColor || textColor);
  const resolvedShowDot = showDot ?? false;
  const resolvedBgColor = bgColor ?? "#F7F8F7";
  const resolvedTextColor = textColor ?? "#374151";
  const resolvedBorderColor = borderColor ?? (hasCustomColors ? "rgba(17, 24, 39, 0.08)" : "#E5E7EB");
  const resolvedDotColor = dotColor ?? "#2F7D4F";
  const resolvedLineHeight = lineHeight ?? Math.max(fontSize + 3, 16);

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap border align-middle",
        "transition-colors duration-150",
        className
      )}
      style={{
        background: resolvedBgColor,
        color: resolvedTextColor,
        height,
        paddingLeft: resolvedShowDot ? Math.max(horizontalPadding - 3, 8) : horizontalPadding,
        paddingRight: horizontalPadding,
        borderRadius: 999,
        borderColor: resolvedBorderColor,
        boxShadow: "none",
        fontFamily: "Arimo, sans-serif",
        fontWeight,
        letterSpacing: 0,
        width,
        fontSize,
        lineHeight: `${resolvedLineHeight}px`,
      }}
    >
      {resolvedShowDot && (
        <span
          aria-hidden="true"
          className="mr-1.5 shrink-0 rounded-full"
          style={{
            width: Math.max(5, height * 0.24),
            height: Math.max(5, height * 0.24),
            background: resolvedDotColor,
            boxShadow: "0 0 0 2px rgba(47, 125, 79, 0.12)",
          }}
        />
      )}
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {text}
      </span>
    </div>
  );
}

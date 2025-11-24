import React from "react";

type TagProps = {
  text: string;
  bgColor?: string;
  textColor?: string;
  height?: number;
  horizontalPadding?: number;
  width?: number | string;
  fontSize?: number;
  lineHeight?: number;
  className?: string;
};

export default function Tag({
  text,
  bgColor = "#F0F0F0",
  textColor = "#FFFFFF",
  height = 25,
  horizontalPadding = 16,
  width,
  fontSize = 14,
  lineHeight,
  className = "",
}: TagProps) {
  const radius = height / 3;

  return (
    <div
      className={[
        "inline-flex items-center justify-center whitespace-nowrap",
        className,
      ].join(" ")}
      style={{
        background: bgColor,
        color: textColor,
        height,
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
        borderRadius: radius,
        fontFamily: "Arimo, sans-serif",
        width,
        fontSize,
        lineHeight: lineHeight ? `${lineHeight}px` : "16px",
      }}
    >
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

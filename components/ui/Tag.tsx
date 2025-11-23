import React from "react";

type TagProps = {
  text: string;
  bgColor?: string;
  textColor?: string;
  height?: number;
  horizontalPadding?: number;
  width?: number | string;
  className?: string;
};

export default function Tag({
  text,
  bgColor = "#F0F0F0",
  textColor = "#FFFFFF",
  height = 25,
  horizontalPadding = 16,
  width,
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
        fontSize: 14,
        lineHeight: "16px",
        width,
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

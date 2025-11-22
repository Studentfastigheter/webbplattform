import React from "react";

type TagProps = {
  text: string;
  bgColor?: string;
  textColor?: string;
  height?: number;
  horizontalPadding?: number;
  className?: string;
};

export default function Tag({
  text,
  bgColor = "#004323",
  textColor = "#FFFFFF",
  height = 25,
  horizontalPadding = 16,
  className = "",
}: TagProps) {
  const radius = height / 2;

  return (
    <div
      className={[ 
        "inline-flex items-center justify-center whitespace-nowrap",
        "shadow-[0px_3px_4px_rgba(0,0,0,0.25)]",
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

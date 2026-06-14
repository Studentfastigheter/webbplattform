import { forwardRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type RichTextProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

export const RichText = forwardRef<HTMLDivElement, RichTextProps>(
  function RichText({ text, className, style }, ref) {
    return (
      <div
        ref={ref}
        className={cn("whitespace-pre-wrap break-words", className)}
        style={style}
      >
        {text}
      </div>
    );
  }
);

export function RichTextParagraph({ text, className, style }: RichTextProps) {
  return (
    <p className={cn("whitespace-pre-wrap break-words", className)} style={style}>
      {text}
    </p>
  );
}

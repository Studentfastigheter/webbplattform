"use client";

import {
  forwardRef,
  type ChangeEvent,
  type ComponentProps,
} from "react";
import { cn } from "@/lib/utils";

type RichTextTextareaProps = ComponentProps<"textarea"> & {
  onValueChange?: (value: string) => void;
};

export const RichTextTextarea = forwardRef<
  HTMLTextAreaElement,
  RichTextTextareaProps
>(function RichTextTextarea(
  { className, onChange, onValueChange, ...props },
  ref
) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange?.(event.currentTarget.value);
    onChange?.(event);
  };

  return (
    <textarea
      {...props}
      ref={ref}
      data-slot="textarea"
      className={cn("whitespace-pre-wrap break-words", className)}
      onChange={handleChange}
    />
  );
});

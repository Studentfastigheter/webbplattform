"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type FileButtonProps = React.ComponentProps<typeof Button> & {
  onFileSelect?: (file: File) => void;
  accept?: string;
};

export const UploadButton = React.forwardRef<
  HTMLButtonElement,
  FileButtonProps
>(function FileButton(
  { onFileSelect, accept = "image/*", children, ...props },
  ref
) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelect?.(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      <Button ref={ref} onClick={handleClick} {...props}>
        {children}
      </Button>
    </>
  );
});
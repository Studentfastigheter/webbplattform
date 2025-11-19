"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "block text-sm font-semibold tracking-tight text-neutral-700",
  {
    variants: {
      tone: {
        default: "text-neutral-700",
        muted: "text-neutral-500",
        contrast: "text-neutral-900",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "md",
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, tone, size, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(labelVariants({ tone, size }), className)}
      {...props}
    />
  )
);

Label.displayName = "Label";

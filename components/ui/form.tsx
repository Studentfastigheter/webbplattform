"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  variant?: "card" | "plain";
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, variant = "plain", ...props }, ref) => {
    const variantClasses =
      variant === "card"
        ? "rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-lg"
        : "";

    return (
      <form
        ref={ref}
        className={cn("space-y-5", variantClasses, className)}
        {...props}
      />
    );
  }
);
Form.displayName = "Form";

export const FormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormField.displayName = "FormField";

export const FormHelper = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-neutral-500", className)}
    {...props}
  />
));
FormHelper.displayName = "FormHelper";

export const FormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium text-red-600", className)}
    role="alert"
    {...props}
  />
));
FormError.displayName = "FormError";

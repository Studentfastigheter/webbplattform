import * as React from "react";
import { cn } from "@/lib/utils";

// Vi definierar typerna själva istället för att ärva från HeroUI
type AppButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "text";

type AppButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean; // Alias för disabled för bakåtkompatibilitet
  asChild?: boolean; // Om du vill använda Radix Slot i framtiden (valfritt)
}

/**
 * App-wide Button wrapper.
 * Helt fri från "use client" och HeroUI-beroenden.
 * Renderar en vanlig HTML-button med Tailwind-klasser.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      fullWidth,
      isLoading = false,
      isDisabled,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Hantera disabled state (både html-disabled och isLoading)
    const isButtonDisabled = isDisabled || disabled || isLoading;

    // Hämta klasser från mappar
    const resolvedSize = sizeClasses[size] ?? sizeClasses.md;
    const variantClass = variantClassMap[variant] ?? variantClassMap.default;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isButtonDisabled}
        className={cn(
          baseClasses,
          resolvedSize,
          variantClass,
          fullWidth && "w-full",
          // Extra styles vid disabled state om det inte täcks av baseClasses
          isLoading && "cursor-wait opacity-70",
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 animate-spin">
            {/* En enkel SVG-spinner så vi slipper ikon-bibliotek beroenden här */}
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// ------------------------------------------------------------------
// STYLES
// ------------------------------------------------------------------

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";

const sizeClasses: Record<AppButtonSize, string> = {
  xs: "h-7 px-3 text-xs min-w-[120px]",
  sm: "h-8 px-3 min-w-[130px]",
  md: "h-9 px-4 min-w-[140px]",
  lg: "h-10 px-6 min-w-[136px]",
  icon: "h-9 w-9 p-0 min-w-0 aspect-square",
  "icon-sm": "h-8 w-8 p-0 min-w-0 aspect-square",
  "icon-lg": "h-10 w-10 p-0 min-w-0 aspect-square",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantClassMap: Record<AppButtonVariant, string> = {
  default: `rounded-full bg-[#004225] text-white hover:bg-[#004225]/90 shadow-[0_6px_14px_rgba(0,0,0,0.18)] duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  
  secondary: `rounded-full border border-[#004225]/30 bg-white text-[#004225] hover:bg-[#004225]/5 duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  
  outline: `rounded-full border border-[#004225] text-[#004225] hover:bg-[#004225]/5 duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  
  ghost: `rounded-full bg-transparent text-[#004225] hover:bg-[#004225]/5 duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  
  destructive: `rounded-full bg-red-600 text-white hover:bg-red-700 shadow-[0_6px_14px_rgba(0,0,0,0.18)] duration-150 ${focusRing} focus-visible:outline-red-600`,
  
  link: `rounded-full bg-transparent text-[#004225] underline-offset-4 hover:underline duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  
  text: `rounded-none bg-transparent text-black underline-offset-2 hover:underline px-0 transition-none ${focusRing} focus-visible:outline-black`,
};

// Vi har tagit bort `mapToHeroProps` och `appVariantMap` eftersom de inte längre behövs.
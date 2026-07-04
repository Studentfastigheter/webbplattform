'use client'

import * as React from "react";
import { cn } from "@/lib/utils";

type AppButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "text";

type AppButtonSize = | "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";

type ButtonOwnProps = {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  /** Visar spinner och blockerar klick — enhetlig laddningsstate i hela appen. */
  isLoading?: boolean;
  /** HeroUI-kompatibelt alias för disabled. */
  isDisabled?: boolean;
  /** HeroUI-kompatibelt alias för onClick. */
  onPress?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Polymorf rendering: as="a" eller as={Link} tillsammans med href. */
  as?: React.ElementType;
  href?: string;
  target?: string;
  rel?: string;
  /** Accepteras för bakåtkompatibilitet med HeroUI-API:t men ignoreras. */
  disableAnimation?: boolean;
  disableRipple?: boolean;
  color?: string;
};

export type ButtonProps = ButtonOwnProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof ButtonOwnProps>;

type ButtonVariantsProps = {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  className?: string;
};

/**
 * App-wide Button. Ren <button> (eller as-elementet) med appens egna
 * Tailwind-varianter — visuellt identisk med den tidigare HeroUI-wrappern,
 * vars alla utseenden redan kom från variantClassMap nedan.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      fullWidth,
      isLoading,
      isDisabled,
      onPress,
      onClick,
      as,
      type,
      disabled,
      // HeroUI-rester — får inte läcka ut på DOM-elementet:
      disableAnimation: _disableAnimation,
      disableRipple: _disableRipple,
      color: _color,
      children,
      ...props
    },
    ref
  ) => {
    const Comp: React.ElementType = as ?? "button";
    const resolvedSize = sizeClasses[size] ?? sizeClasses.md;
    const variantClass = variantClassMap[variant] ?? variantClassMap.default;
    const isButtonElement = Comp === "button";
    const resolvedDisabled = Boolean(disabled || isDisabled || isLoading);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      onPress?.(event);
    };

    return (
      <Comp
        ref={ref}
        // HeroUI defaultade till type="button"; native <button> defaultar till
        // "submit" — behåll det gamla beteendet så formulär inte auto-submittar.
        {...(isButtonElement ? { type: type ?? "button", disabled: resolvedDisabled } : {})}
        aria-busy={isLoading || undefined}
        onClick={handleClick}
        className={cn(
          baseClasses,
          resolvedSize,
          fullWidth && "w-full justify-center",
          variantClass,
          !isButtonElement && resolvedDisabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="size-4 shrink-0 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
            />
          </svg>
        ) : null}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export function buttonVariants({
  variant = "default",
  size,
  className,
}: ButtonVariantsProps = {}) {
  const variantClass = variantClassMap[variant] ?? "";
  const resolvedSize = size ? sizeClasses[size] ?? "" : "";

  return cn(baseClasses, resolvedSize, variantClass, className);
}

const baseClasses =
  "inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold disabled:pointer-events-none disabled:opacity-50";

const sizeClasses: Record<AppButtonSize, string> = {
  xs: "h-7 px-3 text-xs sm:min-w-[120px]",
  sm: "h-8 px-3 sm:min-w-[130px]",
  md: "h-9 px-4 sm:min-w-[140px]",
  lg: "h-10 px-6 sm:min-w-[136px]",
  icon: "h-9 w-9 p-0",
  "icon-sm": "h-8 w-8 p-0",
  "icon-lg": "h-10 w-10 p-0",
};

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantClassMap: Partial<Record<AppButtonVariant, string>> = {
  default:
    `rounded-full bg-[#004225] text-white hover:bg-[#004225]/90 shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-colors duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  secondary:
    `rounded-full border border-[#004225]/30 bg-white text-[#004225] hover:bg-[#004225]/5 transition-colors duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  outline:
    `rounded-full border border-[#004225] text-[#004225] hover:bg-[#004225]/5 transition-colors duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  ghost:
    `rounded-full bg-transparent text-[#004225] hover:bg-[#004225]/5 transition-colors duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  destructive:
    "rounded-full bg-red-600 text-white hover:bg-red-700 shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
  link:
    `rounded-full bg-transparent text-[#004225] underline-offset-4 hover:underline transition-colors duration-150 ${focusRing} focus-visible:outline-[#004225]`,
  text:
    "rounded-none bg-transparent text-black underline-offset-2 hover:underline px-0 transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
};

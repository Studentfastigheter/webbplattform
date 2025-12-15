import * as React from "react";
import { cn } from "@/lib/utils";
import { Button as HeroButton } from "@heroui/react";

type HeroButtonProps = React.ComponentProps<typeof HeroButton>;
type HeroVariant = HeroButtonProps["variant"];
type HeroColor = HeroButtonProps["color"];
type HeroSize = HeroButtonProps["size"];

type AppButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "text";

type AppButtonSize = | "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";

export type ButtonProps = Omit<HeroButtonProps, "variant" | "size" | "color"> & {
  variant?: AppButtonVariant | HeroVariant;
  color?: HeroColor;
  size?: AppButtonSize | HeroSize;
  fullWidth?: boolean;
  /**
   * Om du vill ha enhetlig laddningsstate i hela appen.
   */
  isLoading?: boolean;
};

/**
 * App-wide Button wrapper (HeroUI underneath).
 * Use this everywhere: import { Button } from "@/components/ui/button"
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      color,
      fullWidth,
      isLoading,
      isDisabled,
      disableAnimation: disableAnimationProp,
      children,
      ...props
    },
    ref
  ) => {
    // Mappar din design-system variant -> HeroUI props
    const hero = mapToHeroProps(variant, color);
    const resolvedSize = sizeClasses[(size as AppButtonSize) ?? "md"] ?? sizeClasses.md;
    const variantClass = variantClassMap[variant as AppButtonVariant] ?? "";

    const disableAnimation = disableAnimationProp ?? variant === "text";

    return (
      <HeroButton
        ref={ref as any}
        isLoading={isLoading}
        isDisabled={isDisabled}
        // HeroUI använder ofta "variant" + ev. "color"
        variant={hero.variant as any}
        color={hero.color as any}
        disableAnimation={disableAnimation}
        className={cn(
          baseClasses,
          resolvedSize,
          fullWidth && "w-full justify-center",
          variantClass,
          className
        )}
        {...props}
      >
        {children}
      </HeroButton>
    );
  }
);

Button.displayName = "Button";

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold disabled:pointer-events-none disabled:opacity-50";

const sizeClasses: Record<AppButtonSize, string> = {
  xs: "h-7 px-3 text-xs min-w-[120px]",
  sm: "h-8 px-3 min-w-[130px]",
  md: "h-9 px-4 min-w-[140px]",
  lg: "h-10 px-6 min-w-[136px]",
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

const appVariantMap: Record<
  AppButtonVariant,
  { variant: HeroVariant; color?: HeroColor }
> = {
  default: { variant: "solid", color: "success" },
  secondary: { variant: "flat", color: "default" },
  outline: { variant: "bordered", color: "default" },
  ghost: { variant: "light", color: "default" },
  destructive: { variant: "solid", color: "danger" },
  link: { variant: "light", color: "primary" },
  text: { variant: "light", color: "default" },
};

function mapToHeroProps(
  variant: AppButtonVariant | HeroVariant,
  color?: HeroColor
): { variant: HeroVariant; color?: HeroColor } {
  const mapped = appVariantMap[variant as AppButtonVariant];
  if (mapped) {
    return {
      variant: mapped.variant,
      color: color ?? mapped.color,
    };
  }

  return {
    variant: (variant as HeroVariant) ?? "solid",
    color,
  };
}

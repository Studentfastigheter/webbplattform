"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Button } from "@heroui/button";
import React, { useRef, useState } from "react";
import { SkeletonImage } from "@/components/ui/skeleton-image";
import Link from "next/link";


interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: NavbarItem[];
  className?: string;
  onItemClick?: () => void;
}


interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("fixed inset-x-0 top-20 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export type NavbarItem = {
  name: string;
  link?: string;
  dropdown?: {
    name: string;
    link: string;
  }[];
};


export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "55%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex dark:bg-transparent",
        visible && "bg-white/80 dark:bg-neutral-950/80",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
        className,
      )}
    >
      {items.map((item, idx) => (
        <div
          key={`link-${idx}`}
          className="relative flex items-center"
          onMouseEnter={() => setHovered(idx)}
        >
          {/* Huvudlänk */}
          <Link
            href={item.link ?? "#"}
            onClick={onItemClick}
            className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-gray-100 shadow-[0_8px_16px_rgba(15,23,42,0.06)] dark:bg-neutral-800"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </Link>

          {/* Dropdown – visas bara om item.dropdown finns */}
          {item.dropdown && item.dropdown.length > 0 && hovered === idx && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute left-1/2 top-full z-50 -translate-x-1/2"
            >
              <div className="min-w-[190px] overflow-hidden rounded-2xl border border-neutral-200 bg-white/95 shadow-lg shadow-black/5 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/95">
                <ul className="flex flex-col py-1">
                  {item.dropdown.map((subItem, subIdx) => (
                    <li key={subItem.link}>
                      <Link
                        href={subItem.link}
                        onClick={onItemClick}
                        className={cn(
                          "block px-4 py-2.5 text-sm text-neutral-800 transition-colors hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800",
                          subIdx === 0 && "pt-3",
                          subIdx === item.dropdown!.length - 1 && "pb-3",
                        )}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </motion.div>
  );
};



export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && "bg-white/80 dark:bg-neutral-950/80",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-black dark:text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <div className="relative h-8 w-8">
        <SkeletonImage
          src="https://assets.aceternity.com/logo-dark.png"
          alt="logo"
          fill
          className="object-contain"
        />
      </div>
      <span className="font-medium text-black dark:text-white">Startup</span>
    </a>
  );
};

type HeroButtonProps = React.ComponentProps<typeof Button>;

type NavbarButtonProps = {
  href?: string;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & Omit<HeroButtonProps, "children" | "variant" | "color">;

const navbarVariantMap: Record<
  NonNullable<NavbarButtonProps["variant"]>,
  {
    color?: HeroButtonProps["color"];
    variant?: HeroButtonProps["variant"];
    className?: string;
  }
> = {
  primary: {
    color: "success",
    variant: "solid",
    className:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
  },
  secondary: {
    color: "success",
    variant: "light",
    className: "shadow-none bg-transparent text-brand hover:bg-transparent",
  },
  dark: {
    color: "default",
    variant: "solid",
    className:
      "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
  },
  gradient: {
    color: "success",
    variant: "solid",
    className:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  },
};

export const NavbarButton = ({
  href,
  as,
  children,
  className,
  variant = "primary",
  type: buttonType,
  ...props
}: NavbarButtonProps) => {
  const config = navbarVariantMap[variant] ?? navbarVariantMap.primary;
  const Component = href ? as ?? "a" : as ?? "button";
  const resolvedType =
    Component === "button" ? (buttonType as HeroButtonProps["type"]) ?? "button" : undefined;

  return (
    <Button
      {...(href ? { href } : {})}
      as={Component as React.ElementType}
      radius="full"
      color={config.color}
      variant={config.variant}
      type={resolvedType}
      className={cn(
        "px-5 font-semibold tracking-tight transition-transform duration-200 hover:-translate-y-0.5",
        config.className,
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
};


import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type CampusLyanBrandLinkProps = {
  href: string;
  className?: string;
  logoClassName?: string;
  logoSize?: number;
  showText?: boolean;
  textClassName?: string;
};

export function CampusLyanBrandLink({
  href,
  className,
  logoClassName,
  logoSize = 32,
  showText = true,
  textClassName,
}: CampusLyanBrandLinkProps) {
  return (
    <Link
      aria-label="CampusLyan"
      className={cn("flex min-w-0 items-center gap-2", className)}
      href={href}
    >
      <Image
        alt="CampusLyan"
        className={cn("shrink-0", logoClassName)}
        height={logoSize}
        src="/campuslyan-logo.svg"
        width={logoSize}
      />
      {showText && (
        <span
          className={cn(
            "truncate font-semibold tracking-tight text-gray-900",
            textClassName,
          )}
        >
          CampusLyan
        </span>
      )}
    </Link>
  );
}

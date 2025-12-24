import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

type NormalButtonProps = { 
    text?: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary";
    disabled?: boolean;
}

export default function NormalButton({ 
    text = "Klicka här",
    href,
    onClick,
    icon,
    variant,
    disabled,
}: NormalButtonProps) {

    const sharedClasses = "text-sm font-semibold rounded-sm px-4 py-2 flex gap-2 cursor-pointer";
    const primaryClasses = "bg-slate-800 hover:text-neutral-100 text-white";
    const secondaryClasses = "bg-slate-100 hover:text-neutral-800 text-black";

    const classInUse = cn(sharedClasses, variant === "primary" ? primaryClasses : secondaryClasses);

    return (
      href ? (
        <Link href={href} className={classInUse} aria-disabled={disabled} style={disabled ? {opacity: "20%", cursor: "not-allowed"} : {}}>
          {icon}
          {text}
        </Link>
      ) : (
        <button onClick={onClick} className={classInUse} disabled={disabled}>
          {icon}
          {text}
        </button>
      )
    )
}
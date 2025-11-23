import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function NormalButton({ 
    text = "Klicka här",
    href,
    onClick,
    icon
}: { 
    text?: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
}) {
    return (
      href ? (
        <Link href={href} className={`bg-slate-100 hover:text-neutral-800 text-sm font-semibold rounded-sm px-4 py-2 flex gap-2 cursor-pointer`}>
          {icon}
          {text}
        </Link>
      ) : (
        <button onClick={onClick} className={`bg-slate-100 hover:text-neutral-800 text-sm font-semibold rounded-sm px-4 py-2 flex gap-2 cursor-pointer`}>
          {icon}
          {text}
        </button>
      )
    )
}
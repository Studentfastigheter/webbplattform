import Link from "next/link";

export default function NormalButton({ 
    text = "Klicka här",
    href = "#",
    onClick
}: { 
    text?: string;
    href?: string;
    onClick?: () => void;
}) {
    return (
      <Link 
      href={href}
      onClick={onClick}
      className="bg-gray-800 text-white text-sm font-semibold rounded-full px-2.5 py-1 flex gap-1 cursor-pointer">
        {text}
      </Link>
    )
}
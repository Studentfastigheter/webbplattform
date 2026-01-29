import { Button } from "@/components/ui/button";
import Link from "next/link";

type CTAProps = { 
    text?: string;
    href?: string;
    onClick?: () => void;
}

// export default function NormalButton({ 
//     text = "Klicka här",
//     href = "#",
//     onClick
// }: CTAProps) {
//     return (
//       <Link 
//       href={href}
//       onClick={onClick}
//       className="bg-green-700 text-white text-sm font-semibold rounded-sm px-3.5 py-2 flex gap-1 cursor-pointer">
//         {text}
//       </Link>
//     )
// }

export default function NormalButton({ 
    text = "Klicka här",
    href = "#",
    onClick
}: CTAProps) {
    return (
      <Link 
      href={href}
      onClick={onClick}>
        <Button>
            {text}
        </Button>
      </Link>
    )
}
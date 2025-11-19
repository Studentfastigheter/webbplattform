import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import CampusLyanLogo from "@/public/apple-touch-icon.png"
import { dashboardRelPath } from "../_statics/variables";

const navItems = [
    {
        group: {
            name: "Lägenheter",
            order: 1,
        },
        links: [
            { href: `${dashboardRelPath}`, label: "Start", logo: "" },
            { href: `${dashboardRelPath}/annonser`, label: "Annonser", logo: "" },
            { href: `${dashboardRelPath}/ansokningar`, label: "Ansökningar", logo: "" },
        ]
    },
    {
        group: {
            name: "Annat",
            order: 2,
        },
        links: [
          { href: `${dashboardRelPath}/andrahand`, label: "Andrahand", logo: "" },
          { href: `${dashboardRelPath}/kohantera`, label: "Köhantering", logo: "" },
          { href: `${dashboardRelPath}/rapporter`, label: "Rapporter", logo: "" },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname() ?? "";

    return (
    <aside className="bg-brand h-screen w-64 fixed left-0 px-5 z-20">
        <Link href={"/portal"} className="h-16 flex gap-2 items-center m-auto">
            <Image src={CampusLyanLogo} width={32} height={32} alt="CampusLyan"></Image>
            <div className="flex gap-3 justify-center items-center">
                <h3 className="font-semibold text-white text-center">CampusLyan</h3>
                <p className="text-gray-100 font-bold text-xs mt-0.5">PORTAL</p>
            </div>
        </Link>

        <nav className="mt-6">
            {navItems
                .slice()
                .sort((a, b) => (a.group?.order ?? 0) - (b.group?.order ?? 0))
                .map((group) => (
                    <div key={group.group.name} className="mb-6">
                        <h4 className="text-sm text-neutral-200 mb-2">{group.group.name}</h4>
                        <ul className="space-y-1">
                            {group.links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <li key={group.group.name + ":" + link.href}>
                                        <Link
                                            href={link.href}
                                            className={`flex items-center gap-2 py-2 px-3 rounded text-sm text-white hover:bg-green-800 ${isActive ? "bg-green-800 font-semibold" : ""}`}
                                        >
                                            <Image src={CampusLyanLogo} width={16} height={16} alt={"Logo for " + link.label}></Image>
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
        </nav>
    </aside>
  );
}
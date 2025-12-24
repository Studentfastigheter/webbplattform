import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import CampusLyanLogo from "@/public/campuslyan-logo.svg"
import { dashboardRelPath } from "../_statics/variables";
import { ChevronLeft, LayoutDashboard, NotebookTabs, Users } from "lucide-react";

const navItems = [
    {
        group: {
            name: "Lägenheter",
            order: 1,
        },
        links: [
            { href: `${dashboardRelPath}`, label: "Start", Logo: LayoutDashboard },
            { href: `${dashboardRelPath}/annonser`, label: "Annonser", Logo: NotebookTabs },
            { href: `${dashboardRelPath}/ansokningar`, label: "Ansökningar", Logo: Users },
        ]
    },
    // {
    //     group: {
    //         name: "Annat",
    //         order: 2,
    //     },
    //     links: [
    //       { href: `${dashboardRelPath}/andrahand`, label: "Andrahand", Logo: "" },
    //       { href: `${dashboardRelPath}/kohantera`, label: "Köhantering", Logo: "" },
    //       { href: `${dashboardRelPath}/rapporter`, label: "Rapporter", Logo: "" },
    //     ]
    // },
];

export default function Sidebar() {
    const pathname = usePathname() ?? "";

    return (
    <aside className="bg-gray-100 h-screen w-56 fixed left-0 px-5 z-50">
        <div className="relative">
          <Link href={"/portal"} className="h-16 flex gap-2 items-center m-auto">
              <Image src={CampusLyanLogo} width={32} height={32} alt="CampusLyan"></Image>
              <h3 className="font-semibold text-brand text-center">CampusLyan</h3>
          </Link>
          <button className="absolute top-[50%] translate-y-[-50%] right-0 cursor-pointer">
            <ChevronLeft size={16} />
          </button>
        </div>

        <nav className="mt-6">
            {navItems
                .slice()
                .sort((a, b) => (a.group?.order ?? 0) - (b.group?.order ?? 0))
                .map((group) => (
                    <div key={group.group.name} className="mb-12">
                        <h4 className="text-neutral-400 mb-2 uppercase text-[11px] font-medium tracking-wider">{group.group.name}</h4>
                        <ul className="space-y-1">
                            {group.links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <li className="relative group" key={group.group.name + ":" + link.href}>
                                        <div className={`${isActive ? "block" : "hidden"} absolute w-1 left-0 top-1.5 bottom-1.5 rounded-r-full bg-gradient-to-r to-green-600 from-green-700`} />
                                        <Link
                                            href={link.href}
                                            className={`flex items-center gap-2 py-2 pl-3 pr-2 rounded text-sm group-hover:text-black ${isActive ? "font-bold text-black" : "text-gray-500 font-medium"}`}
                                        >
                                            {link.Logo && <link.Logo width={16} height={16} fill={isActive ? "none" : "none"} color="currentColor" className={`${isActive ? "text-brand" : "text-gray-400 group-hover:text-black"}`} />}
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
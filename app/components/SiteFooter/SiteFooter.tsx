"use client";

import { FaLinkedin, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = [
    { href: "https://www.linkedin.com/company/campuslyan", label: "LinkedIn", icon: <FaLinkedin /> },
    { href: "https://www.instagram.com/campuslyan", label: "Instagram", icon: <FaInstagram /> },
    { href: "https://www.facebook.com/campuslyan", label: "Facebook", icon: <FaFacebook /> },
    { href: "https://www.tiktok.com/@campuslyan", label: "TikTok", icon: <FaTiktok /> },
    { href: "https://www.threads.net/@campuslyan", label: "Threads", icon: <SiThreads /> },
  ];

  const footerLinks = [
    { href: "/om", label: "Om CampusLyan" },
    { href: "/partners", label: "Samarbetspartners" },
    { href: "/kundservice", label: "Kundservice & kontakt" },
    { href: "/privacy", label: "Integritet" },
    { href: "/for-foretag", label: "För företag" },
    { href: "/hyra-ut", label: "Hyra ut" },
  ];

  return (
    <footer className="mt-16 bg-gradient-to-b from-[#0f172a] via-[#0b1120] to-[#020617] text-slate-200">
      <div className="container-page border-t border-white/10 py-8 flex flex-col gap-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-white">CampusLyan</span>
          <span className="text-slate-400">© {year} Alla rättigheter reserverade.</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-slate-300">
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-center gap-3 text-xl">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="text-slate-300 transition hover:text-white"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

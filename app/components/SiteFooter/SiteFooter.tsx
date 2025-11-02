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

  return (
    <footer className="mt-16 border-t border-border">
      <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">CampusLyan</span>
          <span>© {year}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-4">
          <a href="/om" className="hover:underline">Om CampusLyan</a>
          <a href="/partners" className="hover:underline">Samarbetspartners</a>
          <a href="/kundservice" className="hover:underline">Kundservice & kontakt</a>
          <a href="/privacy" className="hover:underline">Integritet</a>
        </nav>

        <div className="flex items-center gap-3 text-xl">
          {socials.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="text-foreground/70 hover:text-brand transition">
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

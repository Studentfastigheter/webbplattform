"use client";

import React from "react";
import Image from "next/image";
import {
  Check,
  ArrowRight,
  Users2,
  ShieldCheck,
  MapPin,
  Search,
  Linkedin,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionBadge } from "@/components/ui/section-badge";
import { Hero } from "@/components/sections/hero";

/* -------------------------------------------------------------------------- */
/*                                   DATA                                     */
/* -------------------------------------------------------------------------- */

const STATS = [
  { label: "Lansering", value: "2026" },
  { label: "Publicerade bostäder", value: "0" },
  { label: "Registrerade studenter", value: "0" },
];

const VALUES = [
  {
    badge: "Marknaden",
    title: "Hela marknaden på ett ställe",
    tags: ["Alla bostadsbolag", "Köer", "Privatuthyrare"],
    description:
      "Slipp leta på dussintals sajter. Vi samlar bostäder från hela Sverige i en och samma plattform.",
    icon: Search,
  },
  {
    badge: "Studentfokus",
    title: "Designat för studentlivet",
    tags: ["Närhet till campus", "Studieliv", "Pendling"],
    description:
      "Se direkt hur bostaden passar din vardag – från restider till närliggande studieplatser.",
    icon: MapPin,
  },
  {
    badge: "Tillgänglighet",
    title: "Helt kostnadsfritt",
    tags: ["Gratis", "Inga avgifter", "Öppet för alla"],
    description:
      "Att hitta bostad ska inte kosta pengar. CampusLyan är gratis för alla studenter.",
    icon: Users2,
  },
  {
    badge: "Trygghet",
    title: "Alltid verifierade aktörer",
    tags: ["Verifiering", "Säkerhet", "Trygg bostad"],
    description:
      "Vi verifierar alla hyresvärdar och aktörer för att minimera risker och bedrägerier.",
    icon: ShieldCheck,
  },
];

const TEAM = [
  {
    title: "Ledning",
    members: [
      {
        name: "Simon Carlén",
        role: "CEO & CTO",
        image: "/team/Profilbild-Simon.jpg",
        linkedin: "https://www.linkedin.com/in/simon-carlén/",
        email: "simon.carlen@campuslyan.se", 
      },
      {
        name: "Alvin Stallgård",
        role: "CCO",
        image: "/team/Profilbild-Alvin.png",
        linkedin: "https://www.linkedin.com/in/alvin-stallg%C3%A5rd-346abb290/",
        email: "alvin.stallgard@campuslyan.se",
      },
      {
        name: "Viktor Kristiansson",
        role: "Head of Backend & Security",
      },
      {
        name: "Mehrdad Hashemi",
        role: "CSO",
        email: "mehrdad.hashemi@campuslyan.se",
      },
    ],
  },
  {
    title: "Produkt & Utveckling",
    members: [
      { name: "Marco Speziale", role: "Backend Engineer" },
      { name: "Mikael Överfjord", role: "Backend Engineer" },
      { name: "Lucas Ryefalk", role: "Frontend Engineer" },
      { name: "William Jaarma", role: "Frontend Engineer" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function OmPage() {
  return (
    <main className="bg-background text-foreground">
      {/* ------------------------------------------------------------------ */}
      {/* HERO – samma struktur & känsla som landingpage                     */}
      {/* ------------------------------------------------------------------ */}
      <Hero
              title="Byggt av studenter för framtidens boende"
              features={[
                { label: 'Grundat på Chalmers' },
                { label: 'Studentfokus' },
                { label: 'Trygg & transparent' },
                { label: 'Nationell plattform' },
              ]}
              cta={{
                label: 'Kontakta oss',
                href: '/om',
              }}
              mainImage={{
                src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675fd56ee2ebe46fa20c27a6_Devices%20SE.png',
                alt: 'Devices',
              }}
              floatingImages={[
                {
                  src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67b5e71b79dd9bba8852dd8d_Bento%20card%20vertical%20SE.png',
                  alt: 'Boka tvättstuga',
                  className: 'top-1/4 -left-10 md:left-0 w-64 transform -rotate-6',
                },
                {
                  src: 'https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67b5e7f28a7f0840c79e9414_Bento%20card%20horizontal%2004%20SE.png',
                  alt: 'Betalning',
                  className: 'bottom-10 -right-10 md:right-0 w-72 transform rotate-3',
                },
              ]}
            />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-2xl border border-border p-6 text-center"
              >
                <p className="text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

      {/* ------------------------------------------------------------------ */}
      {/* VALUES – exakt samma kortstruktur som Features                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <SectionBadge text="Vår vision" />
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Mer än en annonssida
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold text-muted-foreground">
              En plattform för hela boenderesan
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="group bg-card rounded-[2rem] p-8 md:p-12 hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-border"
                >
                  <div className="flex justify-between items-start mb-8">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {v.badge}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-brand-beige-100 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight size={20} />
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {v.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {v.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-2 bg-brand-beige-100 rounded-lg text-sm font-bold text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>

                  <div className="mt-8 h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TEAM – bibehållen men stilmässigt anpassad                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-16">
            <SectionBadge text="Teamet" />
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              Möt människorna bakom CampusLyan
            </h2>
          </div>

          {TEAM.map((group) => (
            <div key={group.title}>
              <h3 className="text-2xl font-bold my-12">{group.title}</h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
                {group.members.map((m) => (
                  <div
                    key={m.name}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="relative h-40 w-40 mb-6 rounded-full overflow-hidden border-4 border-card bg-muted">
                      {m.image ? (
                        <Image
                          src={m.image}
                          alt={m.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Users2 className="w-16 h-16 m-auto mt-10 text-muted-foreground" />
                      )}
                    </div>

                    <h4 className="text-lg font-bold">{m.name}</h4>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                      {m.role}
                    </p>

                    <div className="flex gap-3">
                      {m.linkedin && (
                        <a href={m.linkedin} target="_blank">
                          <Linkedin className="w-5 h-5 text-muted-foreground hover:text-[#0077b5]" />
                        </a>
                      )}
                      {m.email && (
                        <a href={`mailto:${m.email}`}>
                          <Mail className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

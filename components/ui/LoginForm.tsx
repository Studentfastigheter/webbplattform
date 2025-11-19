"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@heroui/button";

import { cn } from "@/lib/utils";

type LoginFormProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  badge?: string;
  sloganTitle?: string;
  sloganDescription?: string;
  switchTitle?: string;
  switchDescription?: string;
  switchButtonLabel: string;
  switchLinkHref: string;
  className?: string;
};

export function LoginForm({
  title,
  subtitle,
  children,
  footer,
  badge = "CampusLyan",
  sloganTitle = "Created by students, for students!",
  sloganDescription = "En trygg plattform för att söka, hyra ut och administrera bostäder.",
  switchTitle = "Hej, student!",
  switchDescription = "Ange dina uppgifter och påbörja din resa tillsammans med oss.",
  switchButtonLabel,
  switchLinkHref,
  className,
}: LoginFormProps) {
  return (
    <main
      className={cn(
        "flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 sm:px-6",
        className
      )}
    >
      <div className="w-full max-w-5xl space-y-8">

        <section className="flex flex-col overflow-hidden rounded-[32px] border border-[#e1e8e3] bg-white shadow-[0_22px_70px_rgba(13,34,23,0.1)] lg:flex-row">
          <div className="flex flex-1 flex-col bg-white px-8 py-10 sm:px-12">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/campuslyan-logo.svg" width={48} height={48} alt="CampusLyan" />
                <span className="text-lg font-semibold text-[#0b2d1c]">CampusLyan</span>
              </Link>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#99a7a0]">konto</span>
            </div>

            <div className="mt-8 flex flex-1 flex-col justify-center gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#0a2d1d]">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-[#56635c]">{subtitle}</p>}
              </div>

              {children}

              {footer && <div className="text-sm text-[#526159]">{footer}</div>}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0c4b2d] via-[#0b6f3f] to-[#0d8f4f] px-10 py-12 text-center text-white lg:max-w-sm">
            <h3 className="text-3xl font-bold">{switchTitle}</h3>
            <p className="mt-4 text-sm text-white/90">{switchDescription}</p>
            <Link href={switchLinkHref} className="mt-8 w-full max-w-xs">
              <Button
                color="default"
                className="w-full bg-white text-[#10315d] font-semibold shadow-lg"
                variant="solid"
              >
                {switchButtonLabel}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

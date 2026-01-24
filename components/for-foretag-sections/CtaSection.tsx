"use client";

import React from "react";
import { Button } from "@heroui/button";

interface CtaSectionProps {
  title: string;
  description: string;
  primaryBtnText: string;
  primaryBtnLink: string;
}

export const CtaSection = ({
  title,
  description,
  primaryBtnText,
  primaryBtnLink,
}: CtaSectionProps) => {
  return (
    <section className="py-12 md:py-20 px-4 ">
      <div className="container mx-auto max-w-6xl">
        {/* Container: Samma stil som CtaBanner med bg-black/20 och kraftig rounding */}
        <div className="bg-black/20 backdrop-blur-md border border-white/5 rounded-[3rem] p-10 md:p-20 relative overflow-hidden shadow-2xl">
          
          {/* Dekorativ Blob: Matchar den gröna tonen från din banner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green-light opacity-10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="space-y-4 text-left">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-brand-beige-100">
                {title}
              </h2>
              
              {/* Description med lägre opacity för hierarki, likt din tidigare banner */}
              <p className="text-2xl md:text-4xl font-bold text-brand-beige-100/60 tracking-tight leading-tight">
                {description}
              </p>
            </div>

            <div className="pt-10">
              <Button
                as="a"
                href={primaryBtnLink}
                // Styling för att matcha "Boka demo"-knappen i bannern
                className="bg-white text-primary px-10 h-[60px] rounded-full text-base font-bold hover:scale-105 transition-all shadow-xl"
              >
                {primaryBtnText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
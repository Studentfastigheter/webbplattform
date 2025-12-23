import React from "react";

interface FeatureRowProps {
  tag: string;
  title: string;
  description: string;
  flipped?: boolean; // Om true: Bild Vänster, Text Höger
  children: React.ReactNode; // Här lägger vi grafiken/bilden
}

export const FeatureRow = ({ tag, title, description, flipped = false, children }: FeatureRowProps) => {
  return (
    <div className="grid lg:grid-cols-2 gap-20 items-center">
      {/* Visual Column */}
      <div className={`${flipped ? 'lg:order-1' : 'lg:order-2 order-1'}`}>
        {children}
      </div>

      {/* Text Column */}
      <div className={`space-y-8 ${flipped ? 'lg:order-2' : 'lg:order-1'} order-2`}>
        <div>
          <span className="text-emerald-600 font-bold uppercase tracking-wider text-xs mb-2 block">{tag}</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">{title}</h2>
        </div>
        <p className="text-lg text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureItem {
  title: string;
  text: string;
  icon: LucideIcon;
}

interface FeatureGridProps {
  title: string;
  subtitle?: string;
  features: FeatureItem[];
}

export const FeatureGrid = ({ title, subtitle, features }: FeatureGridProps) => {
  return (
    <section className="relative z-10 py-24 bg-background/80 backdrop-blur-sm px-6 border-y border-border">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-lg">{subtitle}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

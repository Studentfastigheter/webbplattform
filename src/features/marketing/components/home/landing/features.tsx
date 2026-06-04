import React from "react";

interface FeatureItem {
  badge: string;
  color: string;
  title: string;
  tags: string[];
  img: string;
}

interface FeaturesProps {
  heading?: React.ReactNode;
  features?: FeatureItem[];
  sectionClassName?: string;
  moreLabel?: string;
}

export const Features = ({
  heading,
  features = [],
  sectionClassName = "bg-brand-beige-200",
  moreLabel = "Fler",
}: FeaturesProps) => {
  if (!features || features.length === 0) return null;

  return (
    <section className={`py-16 sm:py-20 lg:py-24 ${sectionClassName}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
          {heading ? (
            <div className="text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-6xl">
              {heading}
            </div>
          ) : null}
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:gap-8">
          {features.map((feature, index) => (
            <div key={`${feature.title}-${index}`} className="group rounded-3xl border border-border bg-card p-5 shadow-[0_18px_50px_-42px_rgba(0,66,37,0.45)] transition-all duration-300 hover:border-primary/30 hover:shadow-2xl sm:rounded-[2rem] sm:p-7 md:p-10 lg:p-12">
              <div className="mb-6 sm:mb-8">
                <span className={`${feature.color} rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground`}>
                  {feature.badge}
                </span>
              </div>

              <h3 className="mb-4 min-h-0 text-xl font-bold text-foreground sm:mb-6 sm:text-2xl md:min-h-[5rem] md:text-3xl">
                {feature.title}
              </h3>

              <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 md:mb-10">
                {feature.tags.map((tag) => (
                  <span key={tag} className="rounded-lg bg-brand-beige-100 px-3 py-1.5 text-xs font-bold text-muted-foreground sm:py-2 sm:text-sm">
                    {tag}
                  </span>
                ))}
                <span className="px-3 py-1.5 text-xs font-bold text-muted-foreground sm:py-2 sm:text-sm">
                  + {moreLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

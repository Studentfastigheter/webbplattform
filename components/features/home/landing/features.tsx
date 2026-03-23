import React from 'react';
import { SectionBadge } from '@/components/ui/section-badge';

// 1. Definiera hur ett feature-objekt ser ut
interface FeatureItem {
  badge: string;
  color: string; // T.ex "bg-primary"
  title: string;
  tags: string[];
  img: string;
}

// 2. Definiera props för komponenten
interface FeaturesProps {
  badge?: string;
  heading?: React.ReactNode; // Gör att vi kan skicka in HTML/JSX för rubriken
  features?: FeatureItem[];
  sectionClassName?: string;
}

export const Features = ({ 
  badge = "Plattformen",
  heading,
  features = [],
  sectionClassName = "bg-brand-beige-200",
}: FeaturesProps) => {

  // Om ingen data finns, visa inget
  if (!features || features.length === 0) return null;

  return (
    <section className={`py-16 sm:py-20 lg:py-24 ${sectionClassName}`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
          <SectionBadge text={badge} />
          
          {heading ? (
            <div className="text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-6xl">
              {heading}
            </div>
          ) : (
            // Default fallback om ingen heading skickas in
            <>
              <h2 className="mb-3 text-3xl font-bold text-foreground sm:mb-4 sm:text-4xl md:text-6xl">Vi digitaliserar boenderesan.</h2>
              <h2 className="text-3xl font-bold text-muted-foreground sm:text-4xl md:text-6xl">Från inflytt till utflytt.</h2>
            </>
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:gap-8">
          {features.map((f, i) => (
            <div key={`${f.title}-${i}`} className="group rounded-3xl border border-transparent bg-card p-5 transition-all duration-300 hover:border-border hover:shadow-2xl sm:rounded-[2rem] sm:p-7 md:p-10 lg:p-12">
              
              <div className="mb-6 sm:mb-8">
                <span className={`${f.color} text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
                  {f.badge}
                </span>
              </div>
              
              <h3 className="mb-4 min-h-0 text-xl font-bold text-foreground sm:mb-6 sm:text-2xl md:min-h-[5rem] md:text-3xl">{f.title}</h3>
              
              <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 md:mb-10">
                {f.tags.map(tag => (
                  <span key={tag} className="rounded-lg bg-brand-beige-100 px-3 py-1.5 text-xs font-bold text-muted-foreground sm:py-2 sm:text-sm">
                    {tag}
                  </span>
                ))}
                <span className="px-3 py-1.5 text-xs font-bold text-muted-foreground sm:py-2 sm:text-sm">+ Fler</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

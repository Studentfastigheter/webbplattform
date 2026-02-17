import React from 'react';
import { ArrowRight } from 'lucide-react';
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
}

export const Features = ({ 
  badge = "Plattformen",
  heading,
  features = []
}: FeaturesProps) => {

  // Om ingen data finns, visa inget
  if (!features || features.length === 0) return null;

  return (
    <section className="py-24 bg-brand-beige-200">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <SectionBadge text={badge} />
          
          {heading ? (
            <div className="text-4xl md:text-6xl font-bold text-foreground">
              {heading}
            </div>
          ) : (
            // Default fallback om ingen heading skickas in
            <>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">Vi digitaliserar boenderesan.</h2>
              <h2 className="text-4xl md:text-6xl font-bold text-muted-foreground">Från inflytt till utflytt.</h2>
            </>
          )}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <div key={`${f.title}-${i}`} className="group bg-card rounded-[2rem] p-8 md:p-12 hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-border">
              
              <div className="flex justify-between items-start mb-8">
                <span className={`${f.color} text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
                  {f.badge}
                </span>
                <div className="w-10 h-10 rounded-full bg-brand-beige-100 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-6 min-h-[5rem] text-foreground">{f.title}</h3>
              
              <div className="flex flex-wrap gap-2 mb-10">
                {f.tags.map(tag => (
                  <span key={tag} className="px-3 py-2 bg-brand-beige-100 rounded-lg text-sm font-bold text-muted-foreground">
                    {tag}
                  </span>
                ))}
                <span className="px-3 py-2 text-sm font-bold text-muted-foreground">+ Fler</span>
              </div>

              <div className="rounded-2xl overflow-hidden bg-brand-beige-100 border border-border">
                <img 
                  src={f.img} 
                  alt={f.title} 
                  loading="lazy"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
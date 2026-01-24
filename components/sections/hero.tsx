import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlipWords } from "@/components/ui/flip-words";

type FeatureItem = {
  label: string;
  icon?: React.ReactNode;
};

type FloatingImage = {
  src: string;
  alt: string;
  className?: string;
};

type HeroProps = {
  title: string | React.ReactNode; 
  flipWords?: string[];            // Orden som ska animeras
  subtitle?: string;
  features?: FeatureItem[];
  cta?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  mainImage?: {
    src: string;
    alt: string;
  };
  floatingImages?: FloatingImage[];
  backgroundClassName?: string;
};

export const Hero: React.FC<HeroProps> = ({
  title,
  flipWords,
  subtitle,
  features = [],
  cta,
  mainImage,
  floatingImages = [],
  backgroundClassName = 'bg-gradient-to-b from-brand-beige-200 to-background',
}) => {
  return (
    <section className={`relative pt-64 pb-20 overflow-hidden ${backgroundClassName}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Textblock */}
        <div className="flex flex-col items-center text-center mb-16">
          
          {/* Rubrik med FlipWords-stöd */}
          <h1 className="text-5xl md:text-[5rem] leading-[1.1] font-bold text-foreground mb-6 max-w-5xl">
            {title}
            
            {/* Om flipWords finns, rendera dem */}
            {flipWords && flipWords.length > 0 && (
              <span className="block mt-2 md:mt-4">
                <FlipWords
                  words={flipWords}
                  duration={2500}
                  className="!text-primary !z-10 relative" 
                />
              </span>
            )}
          </h1>

          {subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              {subtitle}
            </p>
          )}

          {/* Features / Checklista */}
          {features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10 text-sm md:text-base font-bold uppercase tracking-wide">
              {features.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-green-light flex items-center justify-center text-primary">
                    {item.icon ?? <Check size={14} strokeWidth={4} />}
                  </div>
                  <span className="text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Knapp */}
          {cta && (
            cta.href ? (
              <a href={cta.href}>
                <Button variant="default" size="lg" className="px-8 py-6 text-lg">
                  {cta.label}
                </Button>
              </a>
            ) : (
              <Button variant="default" size="lg" className="px-8 py-6 text-lg" onClick={cta.onClick}>
                {cta.label}
              </Button>
            )
          )}
        </div>

        {/* Bildsektion */}
        {mainImage && (
          <div className="relative mt-12 mx-auto max-w-6xl">
            <div className="relative z-10 flex justify-center">
              <img
                src={mainImage.src}
                alt={mainImage.alt}
                className="w-full max-w-[90%] md:max-w-[1000px] h-auto drop-shadow-2xl"
              />
            </div>

            {/* Flytande bilder */}
            {floatingImages.map((img, i) => (
              <div key={i} className={`absolute hidden lg:block ${img.className} z-20`}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="rounded-xl shadow-2xl border border-white/20"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
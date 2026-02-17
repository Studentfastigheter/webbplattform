import React from 'react';
import Marquee from 'react-fast-marquee';

interface Logo {
  src: string;
  alt: string;
}

interface LogoMarqueeProps {
  logos?: Logo[];
  speed?: number;
  className?: string;
}

export const LogoMarquee = ({ 
  logos = [], 
  speed = 35, // Sänkte farten lite eftersom loggorna är mindre (känns lugnare)
  className = "" 
}: LogoMarqueeProps) => {

  if (!logos || logos.length === 0) return null;

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-6 ${className}`}>
      
      <div className="relative flex items-center justify-center mb-6">
        <p className="text-sm text-muted-foreground text-center font-medium">
          Byggt av personer från
        </p>
      </div>

      <div 
        className="relative flex overflow-hidden"
        style={{ 
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <Marquee 
          speed={speed} 
          pauseOnHover={false} 
          gradient={false} 
          autoFill={true} 
        >
          {logos.map((logo, idx) => (
            <div 
              key={`${logo.alt}-${idx}`} 
              // MINDRE MARGINALER:
              // mx-4 (16px) sida = 32px totalt gap på mobil
              // mx-8 (32px) sida = 64px totalt gap på desktop
              className="flex items-center justify-center mx-6 md:mx-16"
            >
              <img 
                src={logo.src} 
                alt={logo.alt} 
                loading="lazy"
                // MINDRE LOGGOR:
                // h-8 (32px) mobil / h-12 (48px) desktop
                // max-w minskad till 100px mobil / 150px desktop
                className="
                  h-8 md:h-12 
                  w-auto 
                  max-w-[100px] md:max-w-[150px] 
                  object-contain 
                  grayscale opacity-60 hover:grayscale-0 hover:opacity-100 
                  transition-all duration-300
                " 
              />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

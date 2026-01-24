import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link'; // Eller <a> om du inte kör Next.js

// Datastruktur för korten
interface ContactCardItem {
  id: number;
  title: string;
  description: React.ReactNode;
  linkText: string;
  href: string;
  iconSrc: string;
}

const contactCards: ContactCardItem[] = [
  {
    id: 1,
    title: "Support",
    description: "Behöver du hjälp med något?",
    linkText: "KONTAKTA",
    href: "https://avyenduser.zendesk.com/hc/sv/requests/new",
    iconSrc: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/67d7ca1837dcc5f5a724951c_Support%20icon.png"
  },
  {
    id: 2,
    title: "Boka demo",
    description: (
      <>
        Boka en personlig demo av Avys Boendeplattform för att få svar på generella frågor samt prisplan.
      </>
    ),
    linkText: "BOKA DEMO",
    href: "https://customer.avy.se/sv/sv/boka/demo",
    iconSrc: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675a9da2bed0364165169edb_Demo%20icon.png"
  },
  {
    id: 3,
    title: "Förfrågningar om produktsamarbeten",
    description: (
      <>
        Petter Arvidsson, CPO<br />petter.arvidsson@avy.se
      </>
    ),
    linkText: "KONTAKTA",
    href: "mailto:petter.arvidsson@avy.se",
    iconSrc: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675a9dbfc7adc95576614d40_Partnership%20icon.png"
  },
  {
    id: 4,
    title: "Presskontakt",
    description: (
      <>
        Frida Fors Wallsbeck, Head of Marketing<br />frida.wallsbeck@avy.se
      </>
    ),
    linkText: "KONTAKTA",
    href: "mailto:frida.wallsbeck@avy.se",
    iconSrc: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675a9de6fea0581cce74303b_Press%20icon.png"
  },
  {
    id: 5,
    title: "Samarbete Tjänsteleverantörer",
    description: (
      <>
        Hannah-Clara Vilsek, Head of Residential Services<br />hannahclara.vilsek@avy.se
      </>
    ),
    linkText: "KONTAKTA",
    href: "mailto:hannahclara.vilsek@avy.se",
    iconSrc: "https://cdn.prod.website-files.com/673c77fa9e60433ef22d4a58/675a9e035961c9875e3d9d4d_Collaboration%20icon.png"
  }
];

const ContactGrid: React.FC = () => {
  return (
    <section id="get-in-touch" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {contactCards.map((card) => (
            <Link 
              key={card.id}
              href={card.href}
              className="group block h-full outline-none"
            >
              <article className="flex flex-col h-full bg-card rounded-[2rem] p-8 md:p-10 hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-border cursor-pointer">
                
                {/* Top Section: Icon Left + Arrow Right */}
                <div className="flex justify-between items-start mb-8">
                  {/* Icon Image */}
                  <div className="relative w-12 h-12">
                    <img 
                      src={card.iconSrc} 
                      alt="" 
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Circle Arrow (Same styling as Features) */}
                  <div className="w-10 h-10 rounded-full bg-brand-beige-100 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <ArrowRight size={20} />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {card.title}
                  </h3>

                  <div className="text-muted-foreground leading-relaxed flex-1 mb-8">
                    {card.description}
                  </div>

                  {/* Link Text (CTA) */}
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
                    {card.linkText}
                  </span>
                </div>

              </article>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
};

export default ContactGrid;
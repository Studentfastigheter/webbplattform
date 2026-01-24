import ContactGrid from '@/components/faq-components/ContactGrid';
import FaqSection from '@/components/faq-components/FAQSection';
import HeroSection from '@/components/faq-components/HeroSection'; // Importera Hero

export const dynamic = "force-static";


export default function Page() {
  return (
    <main>
      
      {/* 1. Hero Sektionen */}
      <HeroSection 
        title="Kontakt"
        description="Vill du veta mer om CampusLyan och hur vi hjälper studenter? Söker du bostad eller vill du samarbeta med oss? Då har du hittat rätt."
        // Du kan byta bild här om du vill, annars används default-bilden från Avy
      />

      {/* 2. Kontakt Grid */}
      <ContactGrid />

      {/* 3. FAQ Sektion */}
      <FaqSection />
      
    </main>
  );
}
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from 'campuslyan';

const answer: React.CSSProperties = { color: 'var(--muted-foreground)', lineHeight: 1.55 };

export const FAQ = () => (
  <Accordion type="single" collapsible defaultValue="item-1" style={{ width: 440 }}>
    <AccordionItem value="item-1">
      <AccordionTrigger>Hur ansöker jag om en bostad?</AccordionTrigger>
      <AccordionContent>
        <p style={answer}>
          Skapa ett konto, fyll i din studentprofil och klicka på "Ansök" på den
          annons du är intresserad av. Hyresvärden hör av sig via meddelanden här
          på CampusLyan.
        </p>
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Vad ingår i hyran?</AccordionTrigger>
      <AccordionContent>
        <p style={answer}>
          Det varierar mellan annonser. Vanligtvis ingår värme, vatten och bredband.
          Se rutan "Detta ingår" på varje enskild annons för exakta villkor.
        </p>
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger>Kostar det något att använda tjänsten?</AccordionTrigger>
      <AccordionContent>
        <p style={answer}>
          Nej, det är helt kostnadsfritt för studenter att söka och ansöka om
          bostäder. Du betalar endast hyran till hyresvärden efter tecknat avtal.
        </p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export const Single = () => (
  <Accordion type="single" collapsible defaultValue="krav" style={{ width: 440 }}>
    <AccordionItem value="krav">
      <AccordionTrigger>Vilka krav ställs på mig som hyresgäst?</AccordionTrigger>
      <AccordionContent>
        <p style={answer}>
          Du behöver vara antagen till en utbildning och kunna visa upp ett giltigt
          studieintyg. Vissa hyresvärdar kräver även borgen eller inkomstunderlag.
        </p>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

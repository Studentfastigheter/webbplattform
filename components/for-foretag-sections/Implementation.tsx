
import Image from 'next/image';
import { SectionBadge } from '../ui/section-badge';

export const Implementation = () => {
  const steps = [
  {
    num: "01",
    title: "Inledande dialog",
    desc: "Vi inleder med ett möte där vi presenterar CampusLyan mer utförligt och sätter oss in i er situation, era mål och nuvarande arbetssätt. Fokus ligger på att förstå er uthyrningsprocess och hur vi kan skapa störst värde för er."
  },
  {
    num: "02",
    title: "Demo & planering",
    desc: "Live-demo av plattformen och dess funktioner, samt hur integrationen mot ert befintliga fastighetssystem sker automatiskt. Tillsammans planerar vi implementationen, tidslinje och nästa steg för ett samarbete."
  },
  {
    num: "03",
    title: "Pilot & implementation",
    desc: "Vi ansluter till ert befintliga fastighetssystem för att smidigt hantera ert bostadsbestånd och säkerställer att annonserna presenteras enligt era önskemål och riktlinjer. Under pilotfasen testar vi samtliga flöden, finjusterar exponeringen och optimerar upplevelsen inför full lansering."
  },
  {
    num: "04",
    title: "Utvärdering & vidare samarbete",
    desc: "Efter implementationen utvärderar vi resultat, synlighet och konvertering. Vi bygger ett långsiktigt partnerskap med tydlig transparens och kontinuerlig optimering för att stärka er närvaro bland studenter."
  }
];

  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-32">
          <div className="lg:w-5/12">
            <div className="sticky top-32">
              <div className="border-l-2 border-white/10 pl-8 md:pl-12">
                <SectionBadge
                  text="Implementation"
                  color="text-brand-green-light"
                  className="tracking-[0.12em]"
                />

                <h2 className="mb-8 text-4xl font-bold leading-[1.1] text-primary-foreground md:text-5xl lg:text-6xl">
                  Från dialog till full räckvidd
                </h2>

                <div className="mt-8 flex items-center gap-4">
                  <Image
                    src="/team/Profilbild-Alvin.png"
                    alt="Alvin"
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-transparent object-cover"
                  />
                  <div>
                    <div className="mb-1 text-sm font-bold uppercase tracking-wide text-primary-foreground">
                      Alvin Stallgård
                    </div>
                    <div className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
                      Chief Commercial Officer
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-7/12">
            <div className="flex flex-col">
              {steps.map((step, index) => (
                <div key={index}>
                  <div className="grid grid-cols-[min-content_1fr] gap-6 py-4 md:gap-10">
                    <div className="text-[4rem] font-bold leading-none text-brand-green-light md:text-[6.25rem]">
                      {step.num}
                    </div>

                    <div className="max-w-[430px] pt-2 md:pt-4">
                      <h3 className="mb-3 text-2xl font-bold text-primary-foreground md:mb-4 md:text-3xl">
                        {step.title}
                      </h3>
                      <p className="text-base leading-relaxed text-primary-foreground/90 md:text-lg">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {index !== steps.length - 1 && (
                    <div className="my-10 h-px w-full bg-white/10 md:my-14" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

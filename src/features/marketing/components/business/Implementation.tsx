
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';
import { localizedText } from '@/i18n/text';

export const Implementation = () => {
  const { locale } = useI18n();
  const steps = [
  {
    num: "01",
    title: localizedText(locale, "Inledande dialog", "Initial dialogue"),
    desc: localizedText(locale, "Vi inleder med ett möte där vi presenterar CampusLyan mer utförligt och sätter oss in i er situation, era mål och nuvarande arbetssätt. Fokus ligger på att förstå er uthyrningsprocess och hur vi kan skapa störst värde för er.", "We start with a meeting where we present CampusLyan in more detail and understand your situation, goals and current workflow. The focus is on understanding your rental process and how we can create the most value for you.")
  },
  {
    num: "02",
    title: localizedText(locale, "Demo & planering", "Demo & planning"),
    desc: localizedText(locale, "Live-demo av plattformen och dess funktioner, samt hur integrationen mot ert befintliga fastighetssystem sker automatiskt. Tillsammans planerar vi implementationen, tidslinje och nästa steg för ett samarbete.", "A live demo of the platform and its features, including how integration with your existing property system works automatically. Together we plan the implementation, timeline and next steps for collaboration.")
  },
  {
    num: "03",
    title: localizedText(locale, "Pilot & implementation", "Pilot & implementation"),
    desc: localizedText(locale, "Vi ansluter till ert befintliga fastighetssystem för att smidigt hantera ert bostadsbestånd och säkerställer att annonserna presenteras enligt era önskemål och riktlinjer. Under pilotfasen testar vi samtliga flöden, finjusterar exponeringen och optimerar upplevelsen inför full lansering.", "We connect to your existing property system to manage your housing stock smoothly and ensure listings are presented according to your preferences and guidelines. During the pilot we test all flows, refine exposure and optimize the experience before full launch.")
  },
  {
    num: "04",
    title: localizedText(locale, "Utvärdering & vidare samarbete", "Evaluation & continued collaboration"),
    desc: localizedText(locale, "Efter implementationen utvärderar vi resultat, synlighet och konvertering. Vi bygger ett långsiktigt partnerskap med tydlig transparens och kontinuerlig optimering för att stärka er närvaro bland studenter.", "After implementation we evaluate results, visibility and conversion. We build a long-term partnership with clear transparency and continuous optimization to strengthen your presence among students.")
  }
];

  return (
    <section className="py-24 bg-primary">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-32">
          <div className="lg:w-5/12">
            <div className="sticky top-32">
              <div className="border-l-2 border-white/10 pl-8 md:pl-12">
                <h2 className="mb-8 text-4xl font-bold leading-[1.1] text-primary-foreground md:text-5xl lg:text-6xl">
                  {localizedText(locale, "Från dialog till full räckvidd", "From dialogue to full reach")}
                </h2>

                <div className="mt-8 flex items-center gap-4">
                  <Image
                    src="/team/Profilbild-Alvin.jpeg"
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

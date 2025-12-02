import type { QueueRule } from "@/components/ads/types";
import { ListChecks } from "lucide-react";

type Props = {
  rules: QueueRule[];
};

export default function QueueRules({ rules }: Props) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white/80 px-6 py-7 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:px-8">
      
      {/* Rubrik */}
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
        Krav för denna bostadskö
      </p>

      {/* Lista */}
      <div className="mt-5 flex flex-col gap-4">
        {rules.map((rule) => (
          <article
            key={rule.title}
            className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >
            {/* Ikonbadge */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <ListChecks className="h-5 w-5 text-green-900" />
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <h3 className="text-[15px] font-semibold text-gray-900">
                {rule.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                {rule.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

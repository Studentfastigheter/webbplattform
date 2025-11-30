import type { QueueRule } from "@/components/ads/types";
import { ListChecks } from "lucide-react";

type Props = {
  rules: QueueRule[];
};

export default function QueueRules({ rules }: Props) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white/80 px-6 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:px-8 sm:py-7">
      
      {/* Rubrik */}
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
        Krav för denna bostadskö
      </p>

      {/* Lista med krav */}
      <div className="mt-4 flex flex-col gap-3">
        {rules.map((rule) => (
          <article
            key={rule.title}
            className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5 sm:py-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                <ListChecks className="h-4 w-4 text-green-900" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  {rule.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-700">
                  {rule.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

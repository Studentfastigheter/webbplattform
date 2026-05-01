import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/ui/Tag";
import type { AdvertiserSummary } from "@/types";
import { ArrowRight, Check, Star } from "lucide-react";

type Props = {
  advertiser: AdvertiserSummary & {
    highlights?: string[];
    reviewCount?: number;
    requirements?: string[];
    totalApartments?: number;
    companyPageUrl?: string;
  };
};

export default function BostadLandlord({ advertiser }: Props) {
  const requirements =
    advertiser.requirements && advertiser.requirements.length > 0
      ? advertiser.requirements
      : [
          "Aktiv studentstatus kan krävas",
          "Inga betalningsanmärkningar",
          "Studieintyg kan behöva bifogas",
          "Personnummer eller samordningsnummer kan krävas",
        ];

  const highlights = advertiser.highlights ?? [];
  const hasRating = advertiser.rating != null;
  const hasApartments = advertiser.totalApartments != null;
  const hasStats = hasApartments || hasRating;

  return (
    <section className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-7">
        <header className="border-b border-gray-100 pb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-24 w-28 shrink-0 overflow-hidden sm:w-32">
                {advertiser.logoUrl ? (
                  <Image
                    src={advertiser.logoUrl}
                    alt={advertiser.displayName}
                    fill
                    sizes="160px"
                    className="object-contain object-left"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-2xl font-semibold text-gray-300">
                    {advertiser.displayName?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]">
                  {advertiser.displayName}
                </h2>

                {hasStats && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    {hasApartments && (
                      <div>
                        <span className="font-semibold text-gray-900">
                          {advertiser.totalApartments?.toLocaleString("sv-SE")}
                        </span>
                        <span className="ml-1 text-gray-500">
                          studentbostäder
                        </span>
                      </div>
                    )}

                    {hasRating && (
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-gray-900 text-gray-900" />
                        <span className="font-semibold text-gray-900">
                          {advertiser.rating?.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({advertiser.reviewCount ?? 0} omdömen)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {advertiser.companyPageUrl && (
              <Link
                href={advertiser.companyPageUrl}
                className="group inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-full bg-[#004225] px-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#00331b] hover:shadow-md active:scale-[0.98]"
              >
                Visa profil
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </header>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-8">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Beskrivning
            </h3>

            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-gray-700">
              {advertiser.description ||
                "Här visas information om bostäderna, området och annat som kan vara relevant för dig som söker boende."}
            </p>

            {highlights.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {highlights.map((highlight) => (
                  <Tag
                    key={highlight}
                    text={highlight}
                    height={28}
                    horizontalPadding={14}
                    fontSize={13}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="border-t border-gray-100 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <h3 className="text-base font-semibold text-gray-900">
              Krav på hyresgäst
            </h3>

            <ul className="mt-4 grid gap-3.5">
              {requirements.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <span className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-white text-[#004225]">
                    <Check className="h-3 w-3 stroke-[2.4]" />
                  </span>

                  <span className="leading-6">{requirement}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
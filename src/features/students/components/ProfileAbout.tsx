import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

type KV = { label: string; value?: string | null };

type ProfileAboutProps = {
  title?: string;
  badges?: string[];
  aboutText?: string | null;

  facts?: KV[];
  preferenceText?: string | null; // should be student.PREFERENCE_TEXT
  interests?: string[];
  languages?: string[];
  seekingTitle?: string;
  interestsLabel?: string;
  languagesLabel?: string;
  hideInterests?: boolean;
  hideLanguages?: boolean;
  className?: string;
};

function Chip({
  children,
  variant = "green",
  className,
}: {
  children: React.ReactNode;
  variant?: "green" | "gray";
  className?: string;
}) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-sm leading-none whitespace-nowrap";
  const styles =
    variant === "green"
      ? "bg-green-900 text-white"
      : "bg-gray-100 text-gray-800 border border-gray-200";
  return <span className={cn(base, styles, className)}>{children}</span>;
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm leading-relaxed">
      <span className="font-semibold text-gray-900">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

export default function ProfileAbout({
  title = "Om mig",
  badges = [],
  aboutText,
  facts = [],
  seekingTitle = "Jag söker",
  preferenceText,
  interests = [],
  languages = [],
  interestsLabel = "Intressen",
  languagesLabel = "Sprak",
  hideInterests = false,
  hideLanguages = false,
  className,
}: ProfileAboutProps) {
  const safeAbout = aboutText?.trim()
    ? aboutText
    : "Ingen profiltext tillagd än.";

  const visibleFacts = facts.filter(
    (f): f is { label: string; value: string } => Boolean(f.value?.trim())
  );

  // ƒo. the actual text shown (DB value wins)
  const shownPreferenceText = preferenceText?.trim() || "";
  const showInterests = !hideInterests;
  const showLanguages = !hideLanguages;

  return (
    <Card
      className={cn(
        "rounded-3xl border border-black/5 bg-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <CardHeader className="px-6 pt-6 pb-0 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-4xl font-medium tracking-tight text-gray-900">
            {title}
          </CardTitle>

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <Chip key={b} variant="green" className="px-4 py-1.5">
                  {b}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-7 pt-6 sm:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_0.9fr] md:gap-10">
          <div className="text-gray-900">
            <ReadMoreComponent
              text={safeAbout}
              variant="large"
              className=""
              textClassName="text-[18px] leading-8 text-gray-900"
              buttonWrapClassName="pt-3"
              moreLabel="Läs mer"
              lessLabel="Visa mindre"
              scrollOffset={300}
            />
          </div>

          <div className="md:border-l md:border-gray-200 md:pl-8">
            <aside
              className={cn(
                "w-full rounded-2xl border border-gray-100 bg-white/70 px-4 py-4 sm:px-5 sm:py-5",
                visibleFacts.length > 0 ? "mt-8" : "mt-0"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-green-900" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                    {seekingTitle}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-800">
                {shownPreferenceText ? shownPreferenceText : "Löpande text.."}
              </div>
            </aside>

            {showInterests && (
              <div className="mt-10">
                <div className="text-lg font-semibold text-gray-900">
                  {interestsLabel}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interests.length > 0 ? (
                    interests.map((i) => (
                      <Chip key={i} variant="gray" className="px-5 py-2">
                        {i}
                      </Chip>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      Inga intressen angivna.
                    </span>
                  )}
                </div>
              </div>
            )}

            {showLanguages && (
              <div className="mt-8">
                <div className="text-lg font-semibold text-gray-900">
                  {languagesLabel}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {languages.length > 0 ? (
                    languages.map((l) => (
                      <Chip key={l} variant="gray" className="px-5 py-2">
                        {l}
                      </Chip>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      Inga språk angivna.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

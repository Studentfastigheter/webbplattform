"use client";

import Script from "next/script";

type BookingSectionProps = {
  id?: string;
  title: string;
  description: string;
  calendarUrl?: string;
};

const DEFAULT_CALENDAR_URL =
  "https://calendly.com/campuslyan/30min?text_color=000000&hide_gdpr_banner=1&primary_color=004225";

export function BookingSection({
  id = "booking",
  title,
  description,
  calendarUrl = DEFAULT_CALENDAR_URL,
}: BookingSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 py-24">
      <div className="mx-auto mb-0 max-w-7xl px-6">
        <h2 className="text-3xl font-bold text-foreground lg:text-4xl">{title}</h2>
        <p className="mt-2 text-lg text-muted-foreground">{description}</p>
      </div>

      <div
        className="calendly-inline-widget w-full"
        data-url={calendarUrl}
        style={{ minWidth: "320px", height: "800px" }}
      />

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </section>
  );
}

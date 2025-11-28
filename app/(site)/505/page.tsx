"use client";

import Link from "next/link";
import { Button } from "@heroui/button";

export default function InternalServerError() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f8faf8] to-[#eef5ef] px-6 py-12 text-center">
      <div className="max-w-xl space-y-6 rounded-3xl bg-white p-10 text-[#0a2d1d] shadow-[0_22px_70px_rgba(13,34,23,0.07)]">
        <p className="font-semibold uppercase tracking-[0.3em] text-sm text-[#6f7b75]">
          Felkod 505
        </p>
        <h1 className="text-4xl font-bold">Oj! Något gick riktigt snett.</h1>
        <p className="text-base text-[#4c5a53]">
          Vi kunde inte hantera din förfrågan just nu. Det är möjligt att
          tjänsten är överbelastad eller att något är trasigt. Ladda om sidan
          eller försök igen lite senare.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            as={Link}
            href="/"
            color="success"
            className="w-full sm:w-auto"
          >
            Till startsidan
          </Button>
          <Button
            variant="bordered"
            as={Link}
            href="/kontakt"
            className="w-full border-[#0a2d1d]/30 text-[#0a2d1d] sm:w-auto"
          >
            Kontakta oss
          </Button>
        </div>

        <div className="rounded-2xl bg-[#f5faf6] p-5 text-left text-sm text-[#3d4a44]">
          <p className="font-semibold">Teknisk info</p>
          <p className="mt-1 text-[#59675f]">
            Felkod: <span className="font-mono">505 HTTP Version Not Supported</span>
          </p>
          <p className="mt-1 text-[#59675f]">
            Om felet kvarstår, maila oss på{" "}
            <a
              href="mailto:support@campuslyan.se"
              className="font-semibold text-[#0c5a34]"
            >
              support@campuslyan.se
            </a>{" "}
            så hjälper vi dig.
          </p>
        </div>
      </div>
    </main>
  );
}

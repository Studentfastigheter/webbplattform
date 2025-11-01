import Link from "next/link";
import Image from "next/image";

export default function Intro() {
  return (
    <section className="pt-10 sm:pt-16">
      <div className="mx-auto max-w-3xl text-center space-y-5">
        <div className="flex justify-center">
          <Image src="/campuslyan-logo.svg" alt="CampusLyan" width={80} height={80} />
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#004225]">
          Hitta ditt nästa studentboende
        </h1>
        <p className="text-gray-700 text-base sm:text-lg">
          CampusLyan samlar studentbostäder från seriösa uthyrare. Ansök, chatta och håll koll – allt på ett ställe.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/listings" className="px-5 py-3 rounded-full bg-[#004225] text-white hover:bg-green-800">
            Se annonser
          </Link>
          <Link href="/register" className="px-5 py-3 rounded-full border border-[#004225] text-[#004225] hover:bg-green-50">
            Skapa konto
          </Link>
        </div>
      </div>
    </section>
  );
}
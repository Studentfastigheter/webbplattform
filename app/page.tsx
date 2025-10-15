import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[1fr_auto] min-h-screen items-center justify-items-center bg-gray-50 text-gray-800 p-8 sm:p-20">
      <main className="flex flex-col gap-10 items-center text-center max-w-2xl">
        {/* LOGO */}
        <Image
          src="/campuslyan-logo.png"
          alt="CampusLyan logo"
          width={180}
          height={180}
          className="rounded-xl"
          priority
        />

        {/* RUBRIK */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Välkommen till <span className="text-green-900">CampusLyan</span>
        </h1>

        {/* TEXT */}
        <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
          En ny plattform för studenter att hitta sitt nästa boende – skapad av studenter, för studenter.  
          Här kan du snart hitta lediga studentlägenheter, hyra ut rum och upptäcka samarbeten med stora studentbostadsbolag.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <a
            href="mailto:info@campuslyan.se"
            className="px-6 py-3 rounded-full bg-green-900 text-white hover:bg-green-800 transition"
          >
            Kontakta oss
          </a>
          <a
            href="https://www.linkedin.com/company/campuslyan/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full border border-green-900 text-green-900 hover:bg-green-50 transition"
          >
            Följ oss på LinkedIn
          </a>
        </div>

        {/* SOCIALA MEDIER */}
        <div className="flex gap-6 mt-8">
          <a href="https://www.linkedin.com/company/campuslyan/" target="_blank" rel="noopener noreferrer">
            <Image src="/icon-linkedin.svg" alt="LinkedIn" width={28} height={28} />
          </a>
          <a href="https://www.facebook.com/profile.php?id=61582374446085" target="_blank" rel="noopener noreferrer">
            <Image src="/icon-facebook.svg" alt="Facebook" width={28} height={28} />
          </a>
          <a href="https://www.instagram.com/campuslyanse/" target="_blank" rel="noopener noreferrer">
            <Image src="/icon-instagram.svg" alt="Instagram" width={28} height={28} />
          </a>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 text-sm text-gray-500">
        © {new Date().getFullYear()} CampusLyan AB – Alla rättigheter förbehållna.
      </footer>
    </div>
  );
}
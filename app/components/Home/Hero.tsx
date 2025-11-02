"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <section className="hero-wrap bleed hero-dark">
      <div className="hero-bg-img" style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170)"
      }} />
      <div className="hero-overlay" />

      <div className="container-page hero-inner two-col">
        <div className="max-w-2xl">
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="badge">Helt Gratis</span>
            <span className="badge">Alla Sveriges Studentbostäder</span>
            <span className="badge">Hitta ditt nästa boende</span>
          </div>
          <h1 className="hero-title">Hitta din nästa studentlya – snabbt och gratis</h1>
          <p className="hero-sub">Bläddra bland studentbostäder, se avstånd till din skola och ställ dig i köer med ett klick.</p>

          <div className="flex items-center gap-3 mt-4">
            <button className="btn btn-primary" onClick={() => router.push('/listings')}>Utforska annonser</button>
            <a className="btn btn-outline" href="#map">Karta på startsidan</a>
          </div>
        </div>

        <div className="hero-media">
          <img
            src="https://image-cdn.mild.cloud/sgs.se/wp-content/uploads/2025/07/7p8a7943sgsblommor-1.jpg?height=1024&aspect_ratio=683:1024&quality=80"
            alt="Studentboende"
          />
        </div>
      </div>
    </section>
  );
}

import Intro from "./components/Intro";
import Sponsors from "./components/Sponsors";
import MapSection from "./components/MapFunctionality/MapSelection";

export default function HomePage() {
  return (
    <div className="container-page">
      
      {/* Intro – stor sektion */}
      <section className="section">
        <Intro />
      </section>

      {/* Sponsorer – mindre sektion + subtil border */}
      <section className="section-sm border-y border-border">
        <Sponsors />
      </section>

      {/* Karta */}
      <section className="section">
        <MapSection />
      </section>

    </div>
  );
}
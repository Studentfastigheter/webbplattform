import Intro from "./components/Intro";
import Sponsors from "./components/Sponsors";
import MapSection from "./components/MapFunctionality/MapSelection";
import Suggested from "./components/Listings/Suggested";
import SchoolSelector from "./components/School/SchoolSelector";
import RelevantQueues from "./components/Queues/RelevantQueues";

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
        <SchoolSelector />
        <div className="mt-6">
          <MapSection />
        </div>
      </section>

      {/* Förslag under kartan */}
      <section className="section">
        <Suggested />
      </section>

      {/* Relevanta köer för vald skola */}
      <section className="section">
        <RelevantQueues />
      </section>

    </div>
  );
}

export default function Trusted() {
  const logos = [
    { name: "SGS", src: "/campuslyan-logo.svg" },
    { name: "Poseidon", src: "/campuslyan-logo.svg" },
    { name: "THS", src: "/campuslyan-logo.svg" },
    { name: "TLTH", src: "/campuslyan-logo.svg" },
  ];
  return (
    <section className="section-sm border-y border-border">
      <div className="container-page">
        <div className="text-center text-sm text-muted mb-4">På väg att bli studenternas förstahandsval</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center justify-items-center opacity-80">
          {logos.map((l, i) => (
            <img key={i} src={l.src} alt={l.name} className="h-8" />
          ))}
        </div>
      </div>
    </section>
  );
}


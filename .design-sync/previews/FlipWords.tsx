import { FlipWords } from 'campuslyan';

const hero: React.CSSProperties = {
  width: 420,
  maxWidth: '100%',
  fontSize: 30,
  lineHeight: 1.2,
  fontWeight: 700,
  color: 'var(--foreground)',
  letterSpacing: '-0.01em',
};
const sub: React.CSSProperties = {
  width: 420,
  maxWidth: '100%',
  fontSize: 20,
  lineHeight: 1.3,
  fontWeight: 600,
  color: 'var(--foreground)',
};

export const Cities = () => (
  <div style={hero}>
    Hitta bostad i
    <FlipWords className="text-brand-500" words={['Lund', 'Malmö', 'Uppsala', 'Göteborg']} />
  </div>
);

export const Audience = () => (
  <div style={sub}>
    Ett tryggt boende för
    <FlipWords className="text-brand-500" words={['studenter', 'utbytesstudenter', 'doktorander']} />
  </div>
);

export const Tagline = () => (
  <div style={{ ...hero, fontSize: 26 }}>
    Studentbostäder som är
    <FlipWords className="text-brand-500" words={['prisvärda', 'verifierade', 'nära campus']} />
  </div>
);

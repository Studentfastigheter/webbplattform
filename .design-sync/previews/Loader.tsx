import { Loader } from 'campuslyan';

const row: React.CSSProperties = { display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' };
const caption: React.CSSProperties = { fontSize: 12, color: 'var(--muted-foreground)', marginTop: 8, textAlign: 'center' };

export const Default = () => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
    <Loader label="Laddar bostäder" />
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <Loader size={20} label="Laddar" />
    <Loader size={32} label="Laddar" />
    <Loader size={48} label="Laddar" />
  </div>
);

export const Colored = () => (
  <div style={row}>
    <Loader size={36} color="#004225" label="Laddar" />
    <Loader size={36} color="#E8590C" label="Laddar" />
    <Loader size={36} color="#98A2B3" label="Laddar" />
  </div>
);

export const InCard = () => (
  <div style={{
    width: 300, height: 160, border: '1px solid var(--border)', borderRadius: 12,
    background: 'var(--card)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  }}>
    <Loader size={40} label="Laddar bostäder" />
    <div style={caption}>Hämtar tillgängliga bostäder i Lund…</div>
  </div>
);

import { CompanyLogo } from 'campuslyan';

const logoMark =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='10' fill='%23004225'/%3E%3Cpath d='M14 25 L24 15 L34 25 M17 23 V34 H31 V23' fill='none' stroke='white' stroke-width='2.4' stroke-linejoin='round' stroke-linecap='round'/%3E%3C/svg%3E";

const list: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14, width: 300 };
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12 };
const name: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: 'var(--foreground)' };
const sub: React.CSSProperties = { fontSize: 12, color: 'var(--muted-foreground)', marginTop: 1 };

const partners = [
  { name: 'Lunds Studentbostäder', city: 'Lund' },
  { name: 'AF Bostäder', city: 'Lund' },
  { name: 'Heimstaden', city: 'Malmö' },
  { name: 'Stena Fastigheter', city: 'Göteborg' },
];

export const Partners = () => (
  <div style={list}>
    {partners.map((p) => (
      <div key={p.name} style={rowStyle}>
        <CompanyLogo name={p.name} alt={p.name} style={{ width: 44, height: 44 }} />
        <div>
          <div style={name}>{p.name}</div>
          <div style={sub}>{p.city}</div>
        </div>
      </div>
    ))}
  </div>
);

export const WithLogo = () => (
  <div style={rowStyle}>
    <CompanyLogo
      src={logoMark}
      name="CampusLyan Fastigheter"
      alt="CampusLyan Fastigheter"
      style={{ width: 64, height: 64 }}
    />
    <div>
      <div style={{ ...name, fontSize: 15 }}>CampusLyan Fastigheter</div>
      <div style={sub}>Verifierad hyresvärd · 42 bostäder</div>
    </div>
  </div>
);

export const Fallback = () => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
    <div style={{ textAlign: 'center' }}>
      <CompanyLogo name="Uppsala Studentbo" alt="Uppsala Studentbo" style={{ width: 56, height: 56 }} />
      <div style={{ ...sub, marginTop: 8 }}>Initial</div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <CompanyLogo alt="Okänd hyresvärd" style={{ width: 56, height: 56 }} />
      <div style={{ ...sub, marginTop: 8 }}>Ikon</div>
    </div>
  </div>
);

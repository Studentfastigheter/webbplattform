import { ScrollArea, MapPin } from 'campuslyan';

const shell: React.CSSProperties = {
  height: 220,
  width: 320,
  border: '1px solid var(--border)',
  borderRadius: 12,
  background: 'var(--card)',
};
const heading: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--foreground)',
  padding: '12px 14px 8px',
};
const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '10px 14px',
  borderTop: '1px solid var(--border)',
};
const title: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: 'var(--foreground)' };
const meta: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  color: 'var(--muted-foreground)',
  marginTop: 2,
};
const price: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#004225', whiteSpace: 'nowrap' };

const listings = [
  { title: 'Ljus etta nära LTH', city: 'Lund', size: '32 m²', rent: '6 500 kr' },
  { title: 'Möblerad korridor', city: 'Uppsala', size: '18 m²', rent: '4 200 kr' },
  { title: 'Tvåa i Flogsta', city: 'Uppsala', size: '54 m²', rent: '8 900 kr' },
  { title: 'Studio på Möllevången', city: 'Malmö', size: '28 m²', rent: '7 100 kr' },
  { title: 'Delad lägenhet', city: 'Göteborg', size: '72 m²', rent: '5 400 kr' },
  { title: 'Nybyggd etta', city: 'Linköping', size: '30 m²', rent: '6 800 kr' },
  { title: 'Vindsvåning centralt', city: 'Umeå', size: '41 m²', rent: '7 600 kr' },
  { title: 'Rum i villa', city: 'Örebro', size: '16 m²', rent: '3 900 kr' },
];

const paragraphs = [
  'Bostaden ligger i ett lugnt studentområde med gångavstånd till campus, mataffär och kollektivtrafik.',
  'Föreningen erbjuder gemensam tvättstuga, cykelrum och en innergård med grillplats som delas av de boende.',
  'Hyran inkluderar värme, vatten och bredband. El tecknas separat av hyresgästen vid inflyttning.',
  'Kontraktet gäller från och med 1 september och löper tolv månader med möjlighet till förlängning.',
  'Visning sker efter överenskommelse. Kontakta hyresvärden via CampusLyan för att boka en tid.',
];

export const Listings = () => (
  <ScrollArea type="always" style={shell}>
    <div style={heading}>128 lediga bostäder</div>
    {listings.map((l) => (
      <div key={l.title} style={row}>
        <div>
          <div style={title}>{l.title}</div>
          <div style={meta}>
            <MapPin size={13} /> {l.city} · {l.size}
          </div>
        </div>
        <span style={price}>{l.rent}/mån</span>
      </div>
    ))}
  </ScrollArea>
);

export const LongText = () => (
  <ScrollArea type="always" style={{ ...shell, height: 180 }}>
    <div style={heading}>Om boendet</div>
    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--foreground)', margin: 0 }}>
          {p}
        </p>
      ))}
    </div>
  </ScrollArea>
);

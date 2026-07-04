import { Checkbox, Label } from 'campuslyan';

const caption: React.CSSProperties = { fontSize: 12, color: 'var(--muted-foreground)' };

const cell: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
};

export const States = () => (
  <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
    <div style={cell}>
      <Checkbox />
      <span style={caption}>Av</span>
    </div>
    <div style={cell}>
      <Checkbox defaultChecked />
      <span style={caption}>Ikryssad</span>
    </div>
    <div style={cell}>
      <Checkbox disabled />
      <span style={caption}>Inaktiverad</span>
    </div>
    <div style={cell}>
      <Checkbox defaultChecked disabled />
      <span style={caption}>Låst</span>
    </div>
  </div>
);

export const Consent = () => (
  <Label htmlFor="villkor" style={{ width: 320 }}>
    <Checkbox id="villkor" defaultChecked />
    Jag godkänner villkoren och integritetspolicyn
  </Label>
);

export const AmenityList = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 260 }}>
    <Label htmlFor="wifi">
      <Checkbox id="wifi" defaultChecked />
      Wifi ingår
    </Label>
    <Label htmlFor="tvatt">
      <Checkbox id="tvatt" defaultChecked />
      Tvättmaskin
    </Label>
    <Label htmlFor="balkong">
      <Checkbox id="balkong" />
      Balkong
    </Label>
    <Label htmlFor="husdjur">
      <Checkbox id="husdjur" />
      Husdjur tillåtet
    </Label>
  </div>
);

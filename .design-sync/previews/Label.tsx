import { Label, Input, Checkbox } from 'campuslyan';

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, width: 280 };

export const WithInput = () => (
  <div style={field}>
    <Label htmlFor="stad">Önskad stad</Label>
    <Input id="stad" placeholder="t.ex. Lund" />
  </div>
);

export const Required = () => (
  <div style={field}>
    <Label htmlFor="telefon">
      Telefonnummer
      <span style={{ color: 'var(--destructive)' }}>*</span>
    </Label>
    <Input id="telefon" type="tel" placeholder="070-123 45 67" />
  </div>
);

export const WithCheckbox = () => (
  <Label htmlFor="villkor" style={{ width: 300 }}>
    <Checkbox id="villkor" defaultChecked />
    Jag godkänner användarvillkoren
  </Label>
);

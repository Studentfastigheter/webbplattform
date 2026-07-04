import { Button } from 'campuslyan';

const row: React.CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' };

export const Variants = () => (
  <div style={row}>
    <Button variant="default">Ansök nu</Button>
    <Button variant="secondary">Spara annons</Button>
    <Button variant="outline">Läs mer</Button>
    <Button variant="ghost">Avbryt</Button>
    <Button variant="destructive">Ta bort</Button>
    <Button variant="link">Villkor</Button>
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <Button variant="default" size="sm">Liten</Button>
    <Button variant="default" size="md">Mellan</Button>
    <Button variant="default" size="lg">Stor</Button>
  </div>
);

export const States = () => (
  <div style={row}>
    <Button variant="default">Normal</Button>
    <Button variant="default" isLoading>Skickar…</Button>
    <Button variant="default" isDisabled>Inaktiverad</Button>
  </div>
);

export const FullWidth = () => (
  <div style={{ width: 320 }}>
    <Button variant="default" fullWidth>Ansök om bostad</Button>
  </div>
);

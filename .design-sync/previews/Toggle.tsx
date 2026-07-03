import { Toggle, Heart, Wifi, Star } from 'campuslyan';

const row: React.CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' };

export const Variants = () => (
  <div style={row}>
    <Toggle variant="default" defaultPressed>Möblerat</Toggle>
    <Toggle variant="outline">Husdjur tillåtet</Toggle>
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <Toggle variant="outline" size="sm">Balkong</Toggle>
    <Toggle variant="outline" size="default">Balkong</Toggle>
    <Toggle variant="outline" size="lg">Balkong</Toggle>
  </div>
);

export const States = () => (
  <div style={row}>
    <Toggle variant="outline">Ledig</Toggle>
    <Toggle variant="outline" defaultPressed>Vald</Toggle>
    <Toggle variant="outline" disabled>Ej tillgänglig</Toggle>
  </div>
);

export const WithIcon = () => (
  <div style={row}>
    <Toggle variant="outline" defaultPressed aria-label="Spara bostad">
      <Heart /> Sparad
    </Toggle>
    <Toggle variant="outline" aria-label="Wifi ingår">
      <Wifi /> Wifi
    </Toggle>
    <Toggle variant="outline" aria-label="Toppbetyg">
      <Star /> Toppbetyg
    </Toggle>
  </div>
);

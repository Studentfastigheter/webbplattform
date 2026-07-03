import { Separator } from 'campuslyan';

const meta: React.CSSProperties = { fontSize: 13, color: 'var(--muted-foreground)' };

export const Horizontal = () => (
  <div style={{ width: 320 }}>
    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>Ljus etta nära campus</div>
    <div style={{ ...meta, marginTop: 2 }}>Lund · Delphi</div>
    <Separator style={{ margin: '12px 0' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', ...meta }}>
      <span>Hyra</span>
      <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>6 500 kr/mån</span>
    </div>
    <Separator style={{ margin: '12px 0' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', ...meta }}>
      <span>Inflyttning</span>
      <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>1 september</span>
    </div>
  </div>
);

export const Vertical = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 18, ...meta }}>
    <span>Lund</span>
    <Separator orientation="vertical" />
    <span>32 m²</span>
    <Separator orientation="vertical" />
    <span>1 rum och kök</span>
    <Separator orientation="vertical" />
    <span>6 500 kr/mån</span>
  </div>
);

export const InList = () => (
  <div style={{ width: 240 }}>
    <div style={{ padding: '8px 0', fontSize: 14, color: 'var(--foreground)' }}>Mina ansökningar</div>
    <Separator />
    <div style={{ padding: '8px 0', fontSize: 14, color: 'var(--foreground)' }}>Sparade bostäder</div>
    <Separator />
    <div style={{ padding: '8px 0', fontSize: 14, color: 'var(--foreground)' }}>Kontoinställningar</div>
  </div>
);

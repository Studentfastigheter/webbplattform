import { ProgressBar } from 'campuslyan';

// The library default fill class (bg-fg-brand-primary) is not defined in this
// build's CSS, so it renders transparent. Override with real DS tokens: a
// brand-green fill on a muted track.
const track = 'bg-muted';
const fill = 'bg-brand-500';

const caption: React.CSSProperties = { fontSize: 13, color: 'var(--foreground)', marginBottom: 8, fontWeight: 600 };
const rowLabel: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 6 };
const pct: React.CSSProperties = { color: '#004225', fontWeight: 600, fontVariantNumeric: 'tabular-nums' };

export const Default = () => (
  <div style={{ width: 320 }}>
    <div style={caption}>Din ansökan</div>
    <ProgressBar value={60} className={track} progressClassName={fill} />
  </div>
);

export const Sweep = () => (
  <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 18 }}>
    {[
      { label: 'Profil ifylld', value: 25 },
      { label: 'Ansökan påbörjad', value: 60 },
      { label: 'Nästan klar', value: 90 },
    ].map((s) => (
      <div key={s.value}>
        <div style={rowLabel}>
          <span>{s.label}</span>
          <span style={pct}>{s.value}%</span>
        </div>
        <ProgressBar value={s.value} className={track} progressClassName={fill} />
      </div>
    ))}
  </div>
);

export const WithLabel = () => (
  <div style={{ width: 320 }}>
    <div style={caption}>Uppladdade dokument</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <ProgressBar value={75} className={track} progressClassName={fill} />
      </div>
      <span style={{ ...pct, fontSize: 14 }}>3 / 4</span>
    </div>
  </div>
);

export const Complete = () => (
  <div style={{ width: 320 }}>
    <div style={rowLabel}>
      <span>Ansökan inskickad</span>
      <span style={pct}>Klar</span>
    </div>
    <ProgressBar value={100} className={track} progressClassName={fill} />
  </div>
);

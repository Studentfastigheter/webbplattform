import { FeaturedIcon, Home, ShieldCheck, MapPin, Wifi, Star, CheckCircle } from 'campuslyan';

// FeaturedIcon's default UntitledUI token classes (bg-brand-secondary,
// text-featured-icon-light-fg-*) are not compiled into this build's CSS, so it
// renders faint out of the box. tailwind-merge (cx) lets a className override win,
// so we set the background with a real DS utility and the glyph color inline
// (icons use fill="currentColor").
const ICON_PX = { sm: 16, md: 20, lg: 24, xl: 28 } as const;
type Size = keyof typeof ICON_PX;

type Item = {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
};

const Feat = ({
  Icon,
  bg,
  color,
  size = 'md',
}: {
  Icon: Item['Icon'];
  bg: string;
  color: string;
  size?: Size;
}) => (
  <FeaturedIcon
    color="brand"
    size={size}
    className={bg}
    icon={<Icon size={ICON_PX[size]} style={{ color }} />}
  />
);

const grid: React.CSSProperties = { display: 'flex', gap: 20, flexWrap: 'wrap' };
const cell: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 88 };
const label: React.CSSProperties = { fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' };

const items: Item[] = [
  { Icon: Home, label: 'Eget boende' },
  { Icon: ShieldCheck, label: 'Verifierad värd' },
  { Icon: MapPin, label: 'Nära campus' },
  { Icon: Wifi, label: 'Bredband ingår' },
];

export const Solid = () => (
  <div style={grid}>
    {items.map((it) => (
      <div key={it.label} style={cell}>
        <Feat Icon={it.Icon} bg="bg-brand-500" color="#ffffff" size="lg" />
        <span style={label}>{it.label}</span>
      </div>
    ))}
  </div>
);

export const Soft = () => (
  <div style={grid}>
    {items.map((it) => (
      <div key={it.label} style={cell}>
        <Feat Icon={it.Icon} bg="bg-brand-50" color="#004225" size="lg" />
        <span style={label}>{it.label}</span>
      </div>
    ))}
  </div>
);

export const Accents = () => (
  <div style={grid}>
    <div style={cell}>
      <Feat Icon={Star} bg="bg-brand-500" color="#ffffff" size="lg" />
      <span style={label}>Toppbetyg</span>
    </div>
    <div style={cell}>
      <Feat Icon={CheckCircle} bg="bg-emerald-500" color="#ffffff" size="lg" />
      <span style={label}>Klar för inflytt</span>
    </div>
    <div style={cell}>
      <Feat Icon={CheckCircle} bg="bg-emerald-50" color="#047857" size="lg" />
      <span style={label}>Godkänd ansökan</span>
    </div>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    {(['sm', 'md', 'lg', 'xl'] as Size[]).map((s) => (
      <Feat key={s} Icon={Home} bg="bg-brand-500" color="#ffffff" size={s} />
    ))}
  </div>
);

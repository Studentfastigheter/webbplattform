import { NavBody, NavItems, NavbarButton } from 'campuslyan';

// The compound nav renders its desktop bar only at the `xl:` breakpoint and is
// `position: fixed` via the <Navbar> wrapper. For a static preview we compose
// NavBody directly (its floating "scrolled" look via visible), flip the base
// `hidden` to `flex`, and let it fill a fixed-width container. Brand colours on
// the CTA come from inline styles (guaranteed) rather than utility tokens.

const items = [
  { name: 'Sök bostad', link: '#' },
  { name: 'Så funkar det', link: '#' },
  { name: 'För hyresvärdar', link: '#' },
];

const brandBtn: React.CSSProperties = { background: 'var(--brand)', color: '#fff' };

const Logo = () => (
  <a
    href="#"
    style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', paddingLeft: 8 }}
  >
    <span
      style={{
        display: 'inline-flex', height: 28, width: 28, alignItems: 'center', justifyContent: 'center',
        borderRadius: 9, background: 'var(--brand)', color: '#fff', fontWeight: 700, fontSize: 15,
      }}
    >
      C
    </span>
    <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em', color: '#111827' }}>
      CampusLyan
    </span>
  </a>
);

const shell: React.CSSProperties = { width: 860, padding: '28px 0 40px' };

export const Desktop = () => (
  <div style={shell}>
    <NavBody visible className="flex w-full max-w-none bg-white">
      <Logo />
      <NavItems items={items} className="flex" />
      <NavbarButton href="#" style={brandBtn}>
        Logga in
      </NavbarButton>
    </NavBody>
  </div>
);

export const WithActions = () => (
  <div style={shell}>
    <NavBody visible className="flex w-full max-w-none bg-white">
      <Logo />
      <NavItems items={items} className="flex" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <NavbarButton href="#" variant="secondary" className="text-gray-700">
          Logga in
        </NavbarButton>
        <NavbarButton href="#" style={brandBtn}>
          Skapa konto
        </NavbarButton>
      </div>
    </NavBody>
  </div>
);

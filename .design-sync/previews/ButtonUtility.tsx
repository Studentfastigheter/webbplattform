import { ButtonUtility, Search, Heart, Star, Mail, Globe } from 'campuslyan';

// UntitledUI icon-only button. Its default color tokens (text-fg-quaternary,
// bg-primary, ring-primary) aren't compiled in this build, so it renders faint.
// We override the icon colour with a real utility (text-current drives the SVG)
// and supply the surface (white fill + 1px ring + shadow) via an inline style,
// since ring-gray-300 isn't in the static CSS. Tooltip is omitted (it only
// shows on hover and needs an overlay provider).

const chip: React.CSSProperties = {
  background: '#fff',
  boxShadow: 'inset 0 0 0 1px #d0d5dd, 0 1px 2px rgba(16,24,40,0.05)',
};

const brandChip: React.CSSProperties = {
  background: 'var(--brand)',
  boxShadow: '0 1px 2px rgba(16,24,40,0.08)',
};

export const Toolbar = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <ButtonUtility icon={Search} className="text-gray-600" style={chip} />
    <ButtonUtility icon={Heart} className="text-gray-600" style={chip} />
    <ButtonUtility icon={Star} className="text-gray-600" style={chip} />
    <ButtonUtility icon={Mail} className="text-gray-600" style={chip} />
    <ButtonUtility icon={Globe} className="text-gray-600" style={chip} />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <ButtonUtility size="xs" icon={Heart} className="text-gray-600" style={chip} />
    <ButtonUtility size="sm" icon={Heart} className="text-gray-600" style={chip} />
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <ButtonUtility icon={Heart} className="text-white" style={brandChip} />
    <ButtonUtility icon={Heart} className="text-gray-600" style={chip} />
    <ButtonUtility icon={Heart} isDisabled className="text-gray-400" style={chip} />
  </div>
);

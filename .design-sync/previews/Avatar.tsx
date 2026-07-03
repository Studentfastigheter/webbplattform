import {
  Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount,
} from 'campuslyan';

const row: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' };
const label: React.CSSProperties = { fontSize: 13, color: 'var(--muted-foreground)' };

// Broken URL 404s gracefully so the initials fallback always renders.
const broken = 'https://campuslyan.se/media/avatars/saknas.jpg';

export const WithFallback = () => (
  <div style={{ ...row, gap: 10 }}>
    <Avatar>
      <AvatarImage src={broken} alt="Anna Lindqvist" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>Anna Lindqvist</div>
      <div style={label}>Student · Lunds universitet</div>
    </div>
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <Avatar size="sm"><AvatarFallback>AL</AvatarFallback></Avatar>
    <Avatar size="default"><AvatarFallback>MK</AvatarFallback></Avatar>
    <Avatar size="lg"><AvatarFallback>JS</AvatarFallback></Avatar>
  </div>
);

export const WithBadge = () => (
  <div style={row}>
    <Avatar size="lg">
      <AvatarImage src={broken} alt="Malin Karlsson" />
      <AvatarFallback>MK</AvatarFallback>
      <AvatarBadge className="bg-emerald-500" />
    </Avatar>
    <span style={label}>Aktiv nu</span>
  </div>
);

export const Group = () => (
  <AvatarGroup>
    <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>
    <Avatar><AvatarFallback>MK</AvatarFallback></Avatar>
    <Avatar><AvatarFallback>JS</AvatarFallback></Avatar>
    <Avatar><AvatarFallback>EN</AvatarFallback></Avatar>
    <AvatarGroupCount>+5</AvatarGroupCount>
  </AvatarGroup>
);

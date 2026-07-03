import { PaginationControls } from 'campuslyan';

const noop = () => {};
const wrap: React.CSSProperties = { width: 360, maxWidth: '100%' };
const caption: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--muted-foreground)',
  textAlign: 'center',
  marginBottom: 10,
};

const labels = {
  ariaLabel: 'Sidnavigering',
  previousLabel: 'Föregående',
  nextLabel: 'Nästa',
  pageLabel: (p: number) => `Sida ${p}`,
};

export const EarlyPage = () => (
  <div style={wrap}>
    <div style={caption}>Sida 2 av 8 · 128 bostäder</div>
    <PaginationControls currentPage={2} totalPages={8} onPageChange={noop} {...labels} />
  </div>
);

export const MiddlePage = () => (
  <div style={wrap}>
    <div style={caption}>Sida 4 av 8 · 128 bostäder</div>
    <PaginationControls currentPage={4} totalPages={8} onPageChange={noop} {...labels} />
  </div>
);

export const FirstPage = () => (
  <div style={wrap}>
    <div style={caption}>Sida 1 av 5 · 74 bostäder</div>
    <PaginationControls currentPage={1} totalPages={5} onPageChange={noop} {...labels} />
  </div>
);

export const LastPage = () => (
  <div style={wrap}>
    <div style={caption}>Sida 8 av 8 · 128 bostäder</div>
    <PaginationControls currentPage={8} totalPages={8} onPageChange={noop} {...labels} />
  </div>
);

import { SearchBar } from 'campuslyan';

const noop = () => {};
const prevent = (e: React.FormEvent<HTMLFormElement>) => e.preventDefault();

const wrap: React.CSSProperties = { width: 440, maxWidth: '100%' };
const caption: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--muted-foreground)',
  marginBottom: 10,
};

export const Empty = () => (
  <div style={wrap}>
    <SearchBar
      value=""
      onValueChange={noop}
      onSubmit={prevent}
      placeholder="Sök bostad, stad eller område"
      submitLabel="Sök"
      clearLabel="Rensa"
    />
  </div>
);

export const WithQuery = () => (
  <div style={wrap}>
    <SearchBar
      value="Lund"
      onValueChange={noop}
      onSubmit={prevent}
      onClear={noop}
      placeholder="Sök bostad, stad eller område"
      submitLabel="Sök"
      clearLabel="Rensa"
    />
  </div>
);

export const HeroSearch = () => (
  <div style={wrap}>
    <div style={caption}>Hitta ditt nästa studentboende</div>
    <SearchBar
      value="Studentlägenhet Uppsala"
      onValueChange={noop}
      onSubmit={prevent}
      onClear={noop}
      placeholder="Sök bostad, stad eller område"
      submitLabel="Sök"
      clearLabel="Rensa"
    />
  </div>
);

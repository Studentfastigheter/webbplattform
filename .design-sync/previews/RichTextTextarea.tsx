import { RichTextTextarea } from 'campuslyan';

const field: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  width: 380,
};
const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--foreground)',
};
const hint: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--muted-foreground)',
};
const area: React.CSSProperties = {
  width: '100%',
  minHeight: 132,
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 10,
  background: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: 'inherit',
  resize: 'none',
  outline: 'none',
};

export const Empty = () => (
  <div style={field}>
    <label style={label} htmlFor="rt-annons">Annonstext</label>
    <RichTextTextarea
      id="rt-annons"
      style={area}
      placeholder="Berätta om lägenheten, läget och vad som ingår i hyran…"
    />
    <span style={hint}>Ju mer detaljer, desto fler ansökningar.</span>
  </div>
);

export const Filled = () => (
  <div style={field}>
    <label style={label} htmlFor="rt-fylld">Beskrivning</label>
    <RichTextTextarea
      id="rt-fylld"
      style={area}
      defaultValue={
        'Rymlig tvåa på 54 m² i Uppsala, nära Flogsta och campus.\n\n' +
        'Möblerad med säng, soffa och matbord. Höghastighetsbredband och ' +
        'el ingår i hyran. Perfekt för en eller två studenter.'
      }
    />
  </div>
);

export const Disabled = () => (
  <div style={field}>
    <label style={label} htmlFor="rt-auto">Genererad sammanfattning</label>
    <RichTextTextarea
      id="rt-auto"
      style={{ ...area, background: 'var(--muted)', color: 'var(--muted-foreground)', cursor: 'not-allowed' }}
      defaultValue="Sammanfattningen skapas automatiskt från annonsens uppgifter och kan inte redigeras."
      disabled
    />
  </div>
);

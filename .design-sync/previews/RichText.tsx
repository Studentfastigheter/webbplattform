import { RichText, RichTextParagraph } from 'campuslyan';

const card: React.CSSProperties = {
  width: 380,
  padding: 16,
  border: '1px solid var(--border)',
  borderRadius: 12,
  background: 'var(--card)',
};
const heading: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--foreground)',
  marginBottom: 8,
};
const body: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: 'var(--foreground)',
};
const muted: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
  color: 'var(--muted-foreground)',
};

export const Description = () => (
  <div style={card}>
    <div style={heading}>Om bostaden</div>
    <RichText
      style={body}
      text={
        'Ljus och nyrenoverad etta på 32 m² i centrala Lund, bara fem minuters ' +
        'promenad från LTH och Universitetssjukhuset.\n\n' +
        'Lägenheten har egen balkong i söderläge, öppen planlösning och ett ' +
        'fullutrustat kök med diskmaskin. Tvättstuga finns i föreningen och ' +
        'cykelrum i källaren.'
      }
    />
  </div>
);

export const HouseRules = () => (
  <div style={card}>
    <div style={heading}>Regler och villkor</div>
    <RichTextParagraph
      style={muted}
      text={
        'Rökfritt boende. Husdjur får tas emot efter överenskommelse med ' +
        'hyresvärden. Andrahandsuthyrning är inte tillåten. Inflyttning sker ' +
        'omgående mot uppvisad antagning eller anställningsbevis.'
      }
    />
  </div>
);

export const Preserved = () => (
  <div style={card}>
    <div style={heading}>Visningstider</div>
    <RichText
      style={{ ...body, fontVariantNumeric: 'tabular-nums' }}
      text={
        'Måndag    17.00–18.30\n' +
        'Onsdag    12.00–13.00\n' +
        'Lördag    10.00–11.30\n\n' +
        'Anmäl dig via CampusLyan senast dagen innan.'
      }
    />
  </div>
);

import { Textarea, Label } from 'campuslyan';

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, width: 360 };
const hint: React.CSSProperties = { fontSize: 13, color: 'var(--muted-foreground)' };

export const WithLabel = () => (
  <div style={field}>
    <Label htmlFor="beskrivning">Beskriv din bostad</Label>
    <Textarea
      id="beskrivning"
      placeholder="Berätta om lägenheten, läget och vad som ingår i hyran…"
    />
    <span style={hint}>Ju mer detaljer, desto fler ansökningar.</span>
  </div>
);

export const Filled = () => (
  <div style={field}>
    <Label htmlFor="annons">Annonstext</Label>
    <Textarea
      id="annons"
      defaultValue={
        'Ljus och nyrenoverad etta på 32 m² i centrala Lund, fem minuters ' +
        'promenad från LTH. Egen balkong i söderläge, tvättmaskin och ' +
        'diskmaskin ingår. Rökfritt boende, inflyttning omgående.'
      }
    />
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}>
    <div style={field}>
      <Label htmlFor="meddelande">Meddelande till hyresvärd</Label>
      <Textarea id="meddelande" placeholder="Skriv en kort presentation av dig själv…" />
    </div>
    <div style={field}>
      <Label htmlFor="last">Automatiskt genererad text</Label>
      <Textarea id="last" defaultValue="Denna beskrivning hämtas från fastighetsregistret." disabled />
    </div>
    <div style={field}>
      <Label htmlFor="fel">Motivering (obligatorisk)</Label>
      <Textarea id="fel" defaultValue="" aria-invalid placeholder="Detta fält kan inte lämnas tomt" />
    </div>
  </div>
);

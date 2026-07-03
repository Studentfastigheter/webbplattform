import { Input, Label } from 'campuslyan';

const stack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, width: 300 };
const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };

export const WithLabels = () => (
  <div style={stack}>
    <div style={field}>
      <Label htmlFor="epost">E-postadress</Label>
      <Input id="epost" type="email" placeholder="namn@student.lu.se" />
    </div>
    <div style={field}>
      <Label htmlFor="losenord">Lösenord</Label>
      <Input id="losenord" type="password" defaultValue="student2026" />
    </div>
  </div>
);

export const Types = () => (
  <div style={stack}>
    <div style={field}>
      <Label htmlFor="sok">Sök bostad</Label>
      <Input id="sok" type="search" placeholder="Lund, Malmö eller Helsingborg" />
    </div>
    <div style={field}>
      <Label htmlFor="hyra">Max hyra per månad (kr)</Label>
      <Input id="hyra" type="number" defaultValue={6500} />
    </div>
    <div style={field}>
      <Label htmlFor="inflytt">Inflyttningsdatum</Label>
      <Input id="inflytt" type="date" defaultValue="2026-08-15" />
    </div>
  </div>
);

export const States = () => (
  <div style={stack}>
    <div style={field}>
      <Label htmlFor="namn">Fullständigt namn</Label>
      <Input id="namn" defaultValue="Elin Andersson" />
    </div>
    <div style={field}>
      <Label htmlFor="personnr">Personnummer (verifierat)</Label>
      <Input id="personnr" defaultValue="20010312-4589" disabled />
    </div>
    <div style={field}>
      <Label htmlFor="epostfel">E-postadress</Label>
      <Input id="epostfel" type="email" defaultValue="elin.student" aria-invalid />
    </div>
  </div>
);

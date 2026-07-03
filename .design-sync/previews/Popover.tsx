import {
  Popover, PopoverTrigger, PopoverContent, Button, Label, Input,
} from 'campuslyan';

export const FilterPopover = () => (
  <Popover defaultOpen>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm">Filtrera</Button>
    </PopoverTrigger>
    <PopoverContent>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>Filtrera bostäder</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label>Maxhyra (kr/mån)</Label>
          <Input placeholder="8 000" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label>Antal rum</Label>
          <Input placeholder="2" />
        </div>
        <Button variant="default" size="sm" fullWidth>Visa 24 bostäder</Button>
      </div>
    </PopoverContent>
  </Popover>
);

import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel,
} from 'campuslyan';

export const CityOpen = () => (
  <Select defaultOpen>
    <SelectTrigger style={{ width: 240 }}>
      <SelectValue placeholder="Välj stad" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Skåne</SelectLabel>
        <SelectItem value="lund">Lund</SelectItem>
        <SelectItem value="malmo">Malmö</SelectItem>
        <SelectItem value="helsingborg">Helsingborg</SelectItem>
      </SelectGroup>
      <SelectGroup>
        <SelectLabel>Västra Götaland</SelectLabel>
        <SelectItem value="goteborg">Göteborg</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

export const Resting = () => (
  <Select defaultValue="lund">
    <SelectTrigger style={{ width: 240 }}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="lund">Lund</SelectItem>
      <SelectItem value="malmo">Malmö</SelectItem>
    </SelectContent>
  </Select>
);

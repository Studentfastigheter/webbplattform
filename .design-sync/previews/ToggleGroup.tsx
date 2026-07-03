import { ToggleGroup, ToggleGroupItem, List, Map } from 'campuslyan';

export const ViewSwitcher = () => (
  <ToggleGroup type="single" defaultValue="lista" variant="outline">
    <ToggleGroupItem value="lista" aria-label="Visa som lista">
      <List /> Lista
    </ToggleGroupItem>
    <ToggleGroupItem value="karta" aria-label="Visa på karta">
      <Map /> Karta
    </ToggleGroupItem>
  </ToggleGroup>
);

export const RoomCount = () => (
  <ToggleGroup type="single" defaultValue="2" variant="outline">
    <ToggleGroupItem value="1">1</ToggleGroupItem>
    <ToggleGroupItem value="2">2</ToggleGroupItem>
    <ToggleGroupItem value="3">3</ToggleGroupItem>
    <ToggleGroupItem value="4">4+</ToggleGroupItem>
  </ToggleGroup>
);

export const Amenities = () => (
  <ToggleGroup type="multiple" defaultValue={['mobler', 'wifi']} variant="outline">
    <ToggleGroupItem value="mobler">Möblerat</ToggleGroupItem>
    <ToggleGroupItem value="wifi">Wifi</ToggleGroupItem>
    <ToggleGroupItem value="tvatt">Tvätt</ToggleGroupItem>
    <ToggleGroupItem value="balkong">Balkong</ToggleGroupItem>
  </ToggleGroup>
);

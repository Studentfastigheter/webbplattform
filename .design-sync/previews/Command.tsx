import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator,
} from 'campuslyan';

export const SearchPalette = () => (
  <Command style={{ width: 440, border: '1px solid var(--border)', borderRadius: 10 }}>
    <CommandInput placeholder="Sök stad, campus eller bostad…" />
    <CommandList>
      <CommandEmpty>Inga resultat.</CommandEmpty>
      <CommandGroup heading="Städer">
        <CommandItem>Lund</CommandItem>
        <CommandItem>Malmö</CommandItem>
        <CommandItem>Göteborg</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Campus">
        <CommandItem>Lunds universitet</CommandItem>
        <CommandItem>Chalmers tekniska högskola</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);

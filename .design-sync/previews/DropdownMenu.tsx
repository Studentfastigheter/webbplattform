import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuSeparator, Button,
} from 'campuslyan';

export const AccountMenu = () => (
  <DropdownMenu defaultOpen>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">Mitt konto</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuLabel>Anna Lindqvist</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Mina ansökningar</DropdownMenuItem>
      <DropdownMenuItem>Sparade bostäder</DropdownMenuItem>
      <DropdownMenuItem>Inställningar</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Logga ut</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

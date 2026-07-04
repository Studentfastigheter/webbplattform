import {
  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, Button,
} from 'campuslyan';

export const VerifiedHost = () => (
  <TooltipProvider>
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">Verifierad hyresvärd</Button>
      </TooltipTrigger>
      <TooltipContent>Identiteten är bekräftad av CampusLyan.</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

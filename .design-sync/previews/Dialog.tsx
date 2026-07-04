import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button,
} from 'campuslyan';

export const ApplyDialog = () => (
  <Dialog defaultOpen>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Bekräfta din ansökan</DialogTitle>
        <DialogDescription>
          Du ansöker om ”Ljus etta nära campus” i Lund. Hyresvärden får din profil
          och kontaktuppgifter när du skickar ansökan.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="ghost" size="sm">Avbryt</Button>
        <Button variant="default" size="sm">Skicka ansökan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

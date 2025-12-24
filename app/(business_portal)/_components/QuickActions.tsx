import Container from "./Container";
import NormalButton from "./NormalButton";


type QuickActionsProps = React.HTMLAttributes<HTMLDivElement> & {

};

export default function QuickActions({
  ...props
}: QuickActionsProps) {
  return (
    <Container {...props}>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Snabbåtgärder</h2>
      <div className="flex gap-4 flex-wrap">
        <NormalButton text="Lägg till annons" />
        <NormalButton text="Importera objekt" />
        <NormalButton text="Annonshantering" />
        
      </div>
    </Container>
  )
}
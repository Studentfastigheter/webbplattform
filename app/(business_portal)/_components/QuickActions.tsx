import Container from "./Container";
import NormalButton from "./NormalButton";

export default function QuickActions({
  columnSpan,
}: {
  columnSpan: number;
}) {
  return (
    <Container columnSpan={columnSpan}>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Snabbåtgärder</h2>
      <div className="flex gap-4 flex-wrap">
        <NormalButton text="Lägg till annons" />
        <NormalButton text="Importera objekt" />
        <NormalButton text="Annonshantering" />
        
      </div>
    </Container>
  )
}
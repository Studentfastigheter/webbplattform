import { Upload } from "lucide-react";
import Container from "../_components/Container";
import DragAndDrop from "../_components/DragAndDrop";

export default function NyAnnons() {
  return (
    <div className="grid grid-cols-12">

      <DragAndDrop columnSpan={4} />

      <Container columnSpan={6}>
        <h2 className="text-2xl font-semibold mb-4">Redo för uppladdning</h2>

        <div className="flex">
          <div>
            
          </div>
        </div>
        
      </Container>
    </div>
  )
}
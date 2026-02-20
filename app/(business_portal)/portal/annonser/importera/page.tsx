import { FolderDown, Plus } from "lucide-react";

export default function ImportAnnonser() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Importera annonser från CSV</h1>
      <p className="mb-4 text-neutral-600">Ladda upp en CSV-fil med dina annonser för att snabbt och enkelt importera dem till plattformen.</p>

        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center gap-2">
                <FolderDown size={48} className="text-neutral-400" />
                <p className="text-sm text-neutral-600">Dra och släpp din CSV-fil här, eller klicka för att välja en fil</p>
                <input type="file" accept=".csv" className="hidden" id="fileInput" />
                <label htmlFor="fileInput" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md">
                    <Plus size={16} />
                    Välj fil
                </label>
            </div>
        </div>
    </div>
  )
}
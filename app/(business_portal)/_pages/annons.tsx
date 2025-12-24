
type AnnonsPageProps = {
    id: string
};


export default function Annons({
    id
}: AnnonsPageProps) {
  return (
    <>
        <div>
            <h1>Annons Page</h1>
            <p>{id}</p>
        </div>
        <div className="fixed bottom-0 right-0 left-56 px-4 py-2 bg-brand">
            <p className="text-white">Detta är en förhandsvisning av din annons.</p>
        </div>
    </>
  )
}
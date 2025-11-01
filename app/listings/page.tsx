import Filters from "../components/Listings/Filters";
import ListWithMap from "../components/Listings/ListWithMaps";

export const dynamic = "force-dynamic";

export default function ListingsPage() {
  return (
    <div className="container-page">
      <section className="section">
        <h1 className="h1 mb-2">Hitta bostad</h1>
        <p className="text-muted mb-6">Sök, filtrera och hitta din nästa studentlya.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <Filters />
          <ListWithMap />
        </div>
      </section>
    </div>
  );
}
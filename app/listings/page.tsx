import Explore from "../components/Listings/Explore";

export const dynamic = "force-dynamic";

export default function ListingsPage() {
  return (
    <div className="container-page">
      <section className="section">
        <h1 className="h1 mb-2">Hitta bostad</h1>
        <p className="text-muted mb-6">Sök, filtrera och hitta din nästa studentlya.</p>

        <Explore />
      </section>
    </div>
  );
}

import BostadAbout from "@/components/ads/BostadAbout";
import BostadGallery from "@/components/ads/BostadGallery";
import BostadLandlord from "@/components/ads/BostadLandlord";
import {
  listingFixtureById,
  listingFixtures,
  type ListingFixture,
} from "@/lib/mockData";

type ListingDetailPage = ListingFixture;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = listingFixtureById[id] ?? listingFixtures[0];

  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <BostadGallery
          title={listing.title}
          images={listing.images.map((img) => img.imageUrl)}
        />
        <BostadAbout listing={listing} />
        <BostadLandlord advertiser={listing.advertiser} />
      </div>
    </main>
  );
}

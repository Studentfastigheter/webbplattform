import QueueHero from "@/components/ads/QueueHero";
import QueueListings from "@/components/ads/QueueListings";
import QueueRules from "@/components/ads/QueueRules";
import {
  queueFixtureById,
  queueFixtures,
  queueListingsByQueueId,
  type QueueFixture,
} from "@/lib/mockData";

type QueueDetail = QueueFixture & {
  stats: NonNullable<QueueFixture["stats"]>;
  rules: NonNullable<QueueFixture["rules"]>;
};

const defaultQueue =
  queueFixtureById["sgs-studentbostader"] ?? queueFixtures[0];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queue = queueFixtureById[id] ?? defaultQueue;
  const queueWithDefaults: QueueDetail = {
    ...queue,
    stats: queue.stats ?? (defaultQueue.stats as QueueDetail["stats"]),
    rules: queue.rules ?? (defaultQueue.rules as QueueDetail["rules"]),
  };

  const listings =
    queueListingsByQueueId[id] ??
    queueListingsByQueueId["sgs-studentbostader"];

  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="flex w-full flex-col gap-10">
        <QueueHero queue={queueWithDefaults} />
        <QueueRules rules={queueWithDefaults.rules} />
        <QueueListings listings={listings} />
      </div>
    </main>
  );
}

import HousingInfoBox from "@/components/ui/housingInfoBox";
import ReadMoreComponent from "@/components/ui/ReadMoreComponent";
import Tag from "@/components/ui/Tag";
import type { ListingDetail } from "@/components/ads/types";
import { Home, MapPin } from "lucide-react";

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700">
      {icon}
      <span>{label}</span>
    </span>
  );
}

type Props = {
  listing: ListingDetail;
};

export default function BostadAbout({ listing }: Props) {
  return (
    <section className="grid gap-8 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)] lg:grid-cols-[1.75fr_0.95fr]">
      <div className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-900">
          Om annonsen
        </p>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
            <InfoChip
              icon={<MapPin className="h-4 w-4 text-green-900" />}
              label={`${listing.area}, ${listing.city}`}
            />
            <InfoChip
              icon={<Home className="h-4 w-4 text-green-900" />}
              label={`${listing.dwellingType} / ${listing.rooms} / ${listing.size}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {listing.tags.map((tag) => (
            <Tag
              key={tag}
              text={tag}
              bgColor="#E9E9E9"
              textColor="#111111"
              height={28}
              horizontalPadding={14}
              fontSize={13}
            />
          ))}
        </div>

        <ReadMoreComponent
          text={listing.description}
          variant="large"
          className="mt-2"
          textClassName="text-base leading-relaxed text-gray-800"
          buttonWrapClassName="justify-start pb-2"
          moreLabel="Las mer"
          lessLabel="Visa mindre"
          scrollOffset={160}
        />
      </div>

      <div className="lg:justify-self-end">
        <HousingInfoBox
          rentText={listing.rent}
          moveInDate={listing.moveIn}
          lastApplyDate={listing.applyBy}
          className="w-full max-w-sm rounded-3xl border border-black/5 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
          rentClassName="border-b border-gray-100 px-6 py-5 text-gray-900"
          rentTextClassName="text-2xl font-semibold"
          moveInClassName="border-b border-gray-100 px-6 py-3 text-sm text-gray-700"
          lastApplyClassName="border-b border-gray-100 px-6 py-3 text-sm text-gray-700"
          buttonClassName="px-6 py-4"
          buttonTextClassName="px-6 text-sm font-semibold"
          buttonText="Intresseanmalan"
        />
      </div>
    </section>
  );
}

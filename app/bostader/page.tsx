import HousingInfoBox from "@/components/ui/housingInfoBox";

export default function Page() {
  return (
    <main className="p-12 flex justify-center">
      <HousingInfoBox
        rentText={3800}
        moveInDate="2026-07-03"
        lastApplyDate="2026-05-24"

        width={340}
        height={200}

        className="
          rounded-[45px]
          bg-white
          shadow-lg
          px-10 py-8
          gap-0      
        "

        rentClassName="text-black"
        rentTextClassName="text-xl font-medium"

        moveInClassName="text-sm"
        lastApplyClassName="text-sm"
      />

    </main>
  );
}

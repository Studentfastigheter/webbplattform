import ProfileHero from "@/components/profile/ProfileHero";
import { schoolsById, studentProfileFixture } from "@/lib/mockData";

export default function Page() {
  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="flex w-full flex-col gap-10">
        <ProfileHero student={studentProfileFixture} schoolsById={schoolsById} />
      </div>
    </main>
  );
}

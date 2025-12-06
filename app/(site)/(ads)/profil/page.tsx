import ProfileHero, {
  type StudentProfile,
} from "@/components/profile/ProfileHero";
import { type ListingCardSmallProps } from "@/components/Listings/ListingCard_Small";
import { CheckCircle2 } from "lucide-react";

const studentProfile: StudentProfile = {
  studentId: 101,
  type: "student",
  email: "amelie.lindberg@student.chalmers.se",
  passwordHash: "",
  createdAt: "2024-11-14T00:00:00Z",
  firstName: "Amelie",
  surname: "Lindberg",
  phone: "+46 73 555 11 22",
  city: "Göteborg",
  verifiedStudent: true,
  bannerImage:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  avatarUrl:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80",
  aboutText:
    "Hej! Jag är inne på termin 5 på Dataingenjörsprogrammet och jobbar extra som studentambassadör. Jag tränar mycket, föredrar lugna fastigheter och uppskattar hyresvärdar som har smidig felanmälan och tydlig kommunikation. Jag söker ett långsiktigt förstahandskontrakt och tar gärna referenser från tidigare boende.",
  preferenceText:
    "Drömboendet är en ljus 1:a eller 2:a med gott om förvaring och cykelrum. Balkong eller uteplats är ett plus men inget krav.",
  tags: ["Dataingenjör", "Göteborg", "Inflytt feb 2026", "Maxhyra 5 800 kr"],
  stats: {
    studyProgram: "Dataingenjör, termin 5",
    studyPace: "100% studietakt",
    preferredArea: "Göteborg · Johanneberg, Vasastan, Linné",
    housingType: "1:a/2:a · minst 22 m²",
    budget: "Max 5 800 kr/månad",
    moveIn: "Februari 2026",
    queueActivity: "3 aktiva köer · 2 ansökningar igång",
    updatedAt: "Uppdaterad 2 dec 2025",
  },
  school: {
    schoolId: 12,
    schoolName: "Chalmers tekniska högskola",
    city: "Göteborg",
  },
};

const preferenceHighlights = [
  {
    title: "Boendetyp & storlek",
    description:
      "Söker 1:a eller 2:a, 22–45 m². Gärna modernt kök, diskmaskin och bra förvaring. Öppet för korridor med eget badrum.",
  },
  {
    title: "Läge & vardag",
    description:
      "Göteborg: Johanneberg, Vasastan eller Linné. Max 25 minuter till campus med cykel/spårvagn, närhet till grönområden och matbutik.",
  },
  {
    title: "Inflytt & ekonomi",
    description:
      "Inflytt från februari 2026. Maxhyra 5 800 kr/mån inklusive värme och bredband. Kan lämna intyg och referenser direkt.",
  },
];


export default function Page() {
  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="flex w-full flex-col gap-10">
        <ProfileHero student={studentProfile} />
      </div>
    </main>
  );
}

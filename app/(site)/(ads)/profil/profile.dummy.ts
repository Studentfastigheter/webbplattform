import type { StudentProfileExtended } from "@/components/profile/ProfileHero";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/user-avatar";

// Byt till false när profilsidan ska läsa från API igen.
export const USE_DUMMY_PROFILE = true;

export const DUMMY_PROFILE: StudentProfileExtended = {
  id: 101,
  email: "klara.andersson@liu.se",
  accountType: "student",
  displayName: "Klara Andersson",
  firstName: "Klara",
  surname: "Andersson",
  createdAt: "2026-02-14T09:00:00.000Z",
  phone: "070-123 45 67",
  city: "Linkoping",
  logoUrl: DEFAULT_PROFILE_IMAGE,
  bannerUrl: "/appartment.jpg",
  bannerImage: "/appartment.jpg",
  avatarUrl: DEFAULT_PROFILE_IMAGE,
  description:
    "Jag pluggar tredje året till civilingenjör och letar efter ett lugnt boende nära campus. " +
    "Vardagarna går mest till studier, träning och ett extrajobb på helgerna. " +
    "Jag är ordningsam, rökfri och uppskattar ett hem där det är enkelt att fokusera men också trevligt att bjuda över vänner på middag ibland.",
  verified: true,
  verifiedStudent: true,
  schoolId: 1,
  schoolName: "Linkopings universitet",
  headline: "Teknisk fysik pa LiU",
  tags: ["Teknisk fysik", "Rokfri", "Lugn", "Stabil inkomst"],
  stats: {
    studyProgram: "Teknisk fysik",
    studyPace: "100%",
    preferredArea: "Valla, T1 eller centrala Linkoping",
  },
  linkedInUrl: "https://www.linkedin.com/in/klara-andersson",
  instagramUrl: "https://www.instagram.com/klara.student",
  facebookUrl: "https://www.facebook.com/klara.andersson",
  verifiedLinkedIn: true,
  verifiedInstagram: true,
  verifiedFacebook: false,
  age: 24,
  likedListings: [],
  listingApplications: [],
  queueApplications: [],
  searchWatchlist: [],
};

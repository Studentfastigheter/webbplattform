"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ListingCardSmall from "@/components/Listings/ListingCard_Small";
import ProfileHero, { type StudentProfile } from "@/components/profile/ProfileHero";
import ProfileHeroActions from "@/components/profile/ProfileHeroActions";
import ProfileAbout from "@/components/profile/ProfileAbout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { backendApi } from "@/lib/api";
import {
  type School,
  type StudentAccount,
  type PrivateLandlordAccount,
  type ListingWithRelations,
} from "@/types";
import { AlertTriangle, MapPin, Mail, Phone, ShieldCheck } from "lucide-react";
import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa6";

type SchoolsMap = Record<number, Pick<School, "schoolName">>;

type LandlordHeroProps = {
  landlord: PrivateLandlordAccount;
  listingsCount: number;
};

const buildProfileFromUser = (user: StudentAccount): StudentProfile => {
  const stats = {
    studyProgram: user.tags?.[0],
    studyPace: "100%",
    preferredArea: user.city ?? undefined,
    housingType: "Studentbostad",
    budget: undefined,
    moveIn: undefined,
    queueActivity: "Ingen statistik tillagd",
    updatedAt: new Date().toLocaleDateString("sv-SE"),
  };

  return {
    ...user,
    stats,
    headline: user.city ?? "Student",
    bannerImage: user.bannerUrl ?? null,
    avatarUrl: user.logoUrl ?? null,

    // ƒo. make sure these exist on the built profile if your API returns them
    preferenceText: (user as any).PREFERENCE_TEXT ?? (user as any).preferenceText ?? null,
    aboutText: (user as any).ABOUT_TEXT ?? (user as any).aboutText ?? null,
  };
};

function LandlordProfileHero({ landlord, listingsCount }: LandlordHeroProps) {
  const fullName = landlord.fullName || landlord.email;
  const contactEmail = landlord.contactEmail ?? landlord.email;
  const contactPhone = landlord.contactPhone ?? landlord.phone ?? undefined;

  const bannerImage = landlord.bannerUrl ?? "/appartment.jpg";
  const avatarImage = landlord.logoUrl ?? "/logos/campuslyan-logo.svg";

  const verificationBadge = landlord.verified
    ? {
        text: "Verifierad uthyrare",
        Icon: ShieldCheck,
        className:
          "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800",
      }
    : {
        text: "Ej verifierad",
        Icon: AlertTriangle,
        className:
          "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800",
      };

  const stats = [
    { label: "Stad", value: landlord.city ?? "Ej angivet" },
    { label: "Abonnemang", value: landlord.subscription ?? "Ingen prenumeration" },
    { label: "Aktiva annonser", value: listingsCount > 0 ? `${listingsCount}` : "Inga just nu" },
    { label: "Rating", value: landlord.rating ? `${landlord.rating.toFixed(1)} / 5` : "Ingen rating" },
  ];

  const contacts = [
    contactEmail
      ? {
          label: "E-post",
          value: contactEmail,
          href: `mailto:${contactEmail}`,
          Icon: Mail,
        }
      : null,
    contactPhone
      ? {
          label: "Telefon",
          value: contactPhone,
          href: `tel:${contactPhone}`,
          Icon: Phone,
        }
      : null,
  ].filter(Boolean) as { label: string; value: string; href: string; Icon: typeof Mail }[];

  const SOCIAL_LINKS = [
    {
      label: "LinkedIn",
      href: (landlord as any).linkedInUrl as string | undefined,
      verified: Boolean((landlord as any).verifiedLinkedIn ?? (landlord as any).linkedInUrl),
      icon: <FaLinkedin />,
    },
    {
      label: "Instagram",
      href: (landlord as any).instagramUrl as string | undefined,
      verified: Boolean((landlord as any).verifiedInstagram ?? (landlord as any).instagramUrl),
      icon: <FaInstagram />,
    },
    {
      label: "Facebook",
      href: (landlord as any).facebookUrl as string | undefined,
      verified: Boolean((landlord as any).verifiedFacebook ?? (landlord as any).facebookUrl),
      icon: <FaFacebook />,
    },
  ] as const;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
      <div className="relative z-0 w-full aspect-[1128/191] min-h-[120px] sm:min-h-[160px] lg:min-h-[190px] bg-gray-100">
        <Image src={bannerImage} alt={fullName} fill className="object-cover" priority />
      </div>

      <div className="relative z-10 px-6 pb-6 pt-0 sm:px-8">
        <div className="mt-4 flex flex-col gap-6 lg:mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative -mt-16 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_10px_28px_rgba(0,0,0,0.20)] sm:-mt-20 sm:h-28 sm:w-28">
                <Image src={avatarImage} alt={fullName} fill className="object-cover" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                    {fullName}
                  </h1>
                  <span className={verificationBadge.className}>
                    <verificationBadge.Icon className="h-3.5 w-3.5" />
                    {verificationBadge.text}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  {landlord.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-green-900" />
                      {landlord.city}
                    </span>
                  )}
                  {landlord.subscription && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {landlord.subscription}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              {SOCIAL_LINKS.map((social) => {
                const base =
                  "flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-full border border-slate-200 bg-white text-lg leading-none transition";
                const state = social.verified
                  ? "text-slate-700 hover:border-slate-400 hover:text-slate-900"
                  : "text-slate-400 opacity-40";

                return social.verified ? (
                  <a
                    key={social.label}
                    href={social.href ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className={`${base} ${state}`}
                  >
                    {social.icon}
                  </a>
                ) : (
                  <span
                    key={social.label}
                    aria-label={social.label}
                    title={social.label}
                    className={`${base} ${state}`}
                  >
                    {social.icon}
                  </span>
                );
              })}
              <div className="overflow-hidden rounded-full">
                <ProfileHeroActions editHref="/installningar" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-white/70 px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {contacts.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {contacts.map(({ label, value, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition hover:border-gray-300"
                >
                  <Icon className="h-4 w-4 text-green-900" />
                  <span className="font-medium">{value}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [schoolsById, setSchoolsById] = useState<SchoolsMap>({});
  const [landlordListings, setLandlordListings] = useState<ListingWithRelations[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const landlordId = user?.type === "private_landlord" ? user.landlordId : null;

  useEffect(() => {
    if (user?.type !== "student") return;

    let active = true;
    setError(null);

    backendApi.schools
      .list()
      .then((schools) => {
        if (!active) return;
        const map: SchoolsMap = {};
        schools.forEach((s) => {
          if (s.schoolId) map[s.schoolId] = { schoolName: s.schoolName };
        });
        setSchoolsById(map);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda skolor.");
      });

    return () => {
      active = false;
    };
  }, [user?.type]);

  useEffect(() => {
    if (!token || user?.type !== "private_landlord" || !landlordId) {
      setLandlordListings([]);
      return;
    }

    let active = true;
    setLoadingListings(true);
    setError(null);

    backendApi.listings
      .list({ size: 200, secure: true }, token)
      .then((res) => {
        if (!active) return;
        const items = res.items ?? [];
        const filtered = items.filter((listing) => listing.landlordId === landlordId);
        setLandlordListings(filtered);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message ?? "Kunde inte ladda dina annonser.");
      })
      .finally(() => {
        if (!active) return;
        setLoadingListings(false);
      });

    return () => {
      active = false;
    };
  }, [token, user?.type, landlordId]);

  if (!user) {
    return (
      <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-800">
          {token ? "Ingen profil att visa." : "Logga in for att se din profil."}
        </div>
      </main>
    );
  }

  if (user.type === "student") {
    const profile = buildProfileFromUser(user);

    const schoolName =
      profile.school?.schoolName ??
      (profile.schoolId ? schoolsById?.[profile.schoolId]?.schoolName : undefined);

    const aboutText =
      profile.aboutText ?? "Ingen profiltext tillagd ÇÏn.";

    return (
      <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
        <div className="flex w-full flex-col gap-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <ProfileHero student={profile} schoolsById={schoolsById} />

          <ProfileAbout
            badges={["RÇôkfri", "SkÇôtsam", "Inga betalningsanmÇÏrkningar"]}
            aboutText={aboutText}
            facts={[
              { label: "Ç.lder", value: (profile as any).age ? `${(profile as any).age} Ç¾r` : undefined },
              { label: "KÇôn", value: (profile as any).gender ?? undefined },
              { label: "Utbildning", value: profile.stats.studyProgram ?? undefined },
              { label: "Skola", value: schoolName ?? undefined },
            ]}
            // ƒo. THIS is the DB field you asked for
            preferenceText={(profile as any).PREFERENCE_TEXT ?? profile.preferenceText ?? null}
            interests={(profile as any).interests ?? ["Plugga", "Festa", "Paddelproffs"]}
            languages={(profile as any).languages ?? ["Svenska", "Engelska", "Spanska"]}
          />
        </div>
      </main>
    );
  }

  if (user.type === "private_landlord") {
    const landlord = user;
    const aboutText = landlord.description ?? "Ingen profiltext tillagd an.";
    const preferenceText =
      landlord.contactNote ??
      "Beratta kort om dina boenden och vilka studenter du soker.";

    return (
      <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
        <div className="flex w-full flex-col gap-6">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <LandlordProfileHero landlord={landlord} listingsCount={landlordListings.length} />

          <ProfileAbout
            title="Om mig som uthyrare"
            badges={landlord.verified ? ["Verifierad uthyrare"] : []}
            aboutText={aboutText}
            facts={[
              { label: "Stad", value: landlord.city ?? undefined },
              { label: "Abonnemang", value: landlord.subscription ?? undefined },
              { label: "Kontakt", value: landlord.contactEmail ?? landlord.email },
              { label: "Telefon", value: landlord.contactPhone ?? landlord.phone ?? undefined },
            ]}
            seekingTitle="Jag erbjuder"
            preferenceText={preferenceText}
            interests={landlord.tags ?? []}
            hideLanguages
          />

          <section className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Mina annonser</h2>
                <p className="text-sm text-gray-600">Annonser kopplade till ditt konto.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button as="a" href="/ansokningar" size="sm" variant="secondary">
                  Ansokningar
                </Button>
                <Button as="a" href="/mina-annonser/ny" size="sm" variant="default">
                  Skapa annons
                </Button>
              </div>
            </div>

            {loadingListings ? (
              <div className="py-8 text-sm text-gray-500">Laddar dina annonser...</div>
            ) : landlordListings.length === 0 ? (
              <div className="py-8 text-sm text-gray-500">
                {token ? "Inga annonser kopplade till ditt konto an." : "Logga in for att se dina annonser."}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {landlordListings.map((listing) => {
                  const primaryImage =
                    typeof listing.images?.[0] === "string"
                      ? (listing.images?.[0] as string)
                      : listing.images?.[0]?.imageUrl;

                  return (
                    <ListingCardSmall
                      key={listing.listingId}
                      title={listing.title}
                      area={listing.area ?? ""}
                      city={listing.city ?? ""}
                      dwellingType={listing.dwellingType ?? ""}
                      rooms={listing.rooms ?? undefined}
                      sizeM2={listing.sizeM2 ?? undefined}
                      rent={listing.rent ?? undefined}
                      landlordType={listing.advertiser?.displayName ?? "Hyresvard"}
                      isVerified={Boolean(landlord.verified)}
                      imageUrl={primaryImage}
                      tags={listing.tags ?? undefined}
                      images={listing.images}
                      onClick={() => router.push(`/bostader/${listing.listingId}`)}
                      variant="default"
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 pb-12 lg:px-6 lg:py-10">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-800">
        Denna vy stoder inte kontotypen an.
      </div>
    </main>
  );
}

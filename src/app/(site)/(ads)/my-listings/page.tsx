"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import ListingCardSmall from "@/features/listings/components/ListingCard_Small";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useMyListings } from "@/features/listings/hooks/useListings";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedText } from "@/i18n/text";

export default function Page() {
  const router = useRouter();
  const { locale, localizedHref } = useI18n();
  const { user, token } = useAuth();

  const canManageListings =
    user?.accountType === "company" || user?.accountType === "private_landlord";

  // useMyListings already gates on auth, but we also disable when the user
  // can't manage listings — no point fetching for student accounts.
  const {
    data: listingsPage,
    isLoading: loading,
    error: queryError,
  } = useMyListings(0, 200);
  const enabled = Boolean(token) && canManageListings;
  const listings = enabled ? listingsPage?.content ?? [] : [];
  const error = enabled && queryError
    ? queryError instanceof Error
      ? queryError.message
      : localizedText(locale, "Kunde inte ladda dina annonser.", "Could not load your listings.")
    : null;

  const gridListings = useMemo(() => listings ?? [], [listings]);

  return (
    <main className="flex flex-col gap-6 pb-12 pt-6 lg:pt-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {localizedText(locale, "Mina annonser", "My listings")}
          </h1>
          <p className="text-sm text-gray-600">
            {localizedText(
              locale,
              "Hantera och granska dina aktiva och kommande annonser.",
              "Manage and review your active and upcoming listings.",
            )}
          </p>
        </div>
        {canManageListings && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => router.push(localizedHref("/my-listings/new"))}
          >
            {localizedText(locale, "Skapa ny annons", "Create new listing")}
          </Button>
        )}
      </header>

      {!token && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {localizedText(locale, "Logga in för att se dina annonser.", "Log in to view your listings.")}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!canManageListings && token && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {localizedText(
            locale,
            "Denna sida är för företagskonton.",
            "This page is for company accounts.",
          )}
        </div>
      )}

      <section>
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {localizedText(locale, "Laddar annonser...", "Loading listings...")}
          </div>
        ) : gridListings.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            {canManageListings
              ? localizedText(locale, "Du har inga annonser än.", "You do not have any listings yet.")
              : localizedText(locale, "Ingen annons att visa just nu.", "No listing to show right now.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridListings.map((listing) => {
              return (
                <ListingCardSmall
                  key={listing.id}
                  title={listing.title}
                  location={listing.location}
                  dwellingType={listing.dwellingType ?? ""}
                  rooms={listing.rooms ?? 0}
                  sizeM2={listing.sizeM2 ?? 0}
                  rent={listing.rent ?? 0}
                  landlordType={listing.hostType}
                  hostName={listing.hostName}
                  hostLogoUrl={listing.hostLogoUrl}
                  isVerified={listing.verifiedHost}
                  imageUrl={listing.imageUrl}
                  tags={listing.tags ?? undefined}
                  showFavoriteButton={false}
                  onClick={() => router.push(localizedHref(`/housing/${listing.id}`))}
                  variant="default"
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

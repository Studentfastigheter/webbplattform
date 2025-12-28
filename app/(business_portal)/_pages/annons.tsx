"use client";

import BostadAbout from "@/components/ads/BostadAbout";
import BostadGallery from "@/components/ads/BostadGallery";
import BostadLandlord from "@/components/ads/BostadLandlord";
import { ListingDetail } from "@/components/ads/types";
import { FormGroup, FormShell, InputField } from "@/components/Dashboard/Form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";


const listingContent: Record<string, ListingDetail> = {
  "vasagatan-19": {
    id: "vasagatan-19",
    title: "1:a Vasagatan 19",
    area: "Innerstan",
    city: "Goteborg",
    address: "Vasagatan 19",
    dwellingType: "Lagenhet",
    rooms: "3 rum",
    size: "42 m2",
    rent: 3800,
    moveIn: "2026-07-03",
    applyBy: "2026-05-24",
    tags: ["Moblerat", "Poangfri", "Diskmaskin"],
    images: [
      "/appartment.jpg",
      "/appartment.jpg",
      "/appartment.jpg",
      "/appartment.jpg",
      "/appartment.jpg",
    ],
    description:
      "Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.Snygg citylya i lugnt kvarter. Modern 1a med gott om ljusinslapp, naturnara promenadstrak och trendiga cafeer runt hornet. Tunnelbanan framfor byggnaden tar dig snabbt till centrala stan pa 9 minuter. Bekvama dubbelsangar eller enkelsangar, pentry med alla nodvandigheter, badrum med dusch, smart-TV med Netflix och snabbt Wi-Fi for distansstudier. I samarbete med en specialist erbjuder vi en gratis guidad rundtur i Gamla Stan for alla bokningar.",
    landlord: {
      name: "SGS Studentbostader",
      subtitle: "Studentbostader",
      logo: "/logos/sgs-logo.svg",
      rating: 4.8,
      reviewCount: 124,
      highlights: [
        "Alla detaljer om boendet finns samlade i SGS-portalen.",
        "Lage nara universitet, cafeer och kollektivtrafik.",
        "Tips om fler studentbostader om du inte far denna.",
        "Support fran SGS kundtjanst vid inflyttning och vardagliga fraga.",
      ],
      contactNote:
        "Kontakta hyresvarden via CampusLyan for fragor eller ombokningar.",
    },
  },
};

const modeText = {
    preview: {
        button: "Växla till redigeringsläge",
        text: "Detta är en förhandsvisning av din annons."
    },
    edit: {
        button: "Växla till förhandsvisning",
        text: "Du är i redigeringsläge."
    }
}


type AnnonsPageProps = {
    id: string
};


export default function Annons({
    id
}: AnnonsPageProps) {

    const [isEditing, setIsEditing] = useState<boolean>(true);

    
    const listing = listingContent[id] ?? listingContent["vasagatan-19"];

    return (
        <>
            <div className="m-2">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
                    <BostadGallery isEditable={isEditing} title={listing.title} images={listing.images} />
                    <BostadAbout isEditable={isEditing} listing={listing} />
                    <BostadLandlord landlord={listing.landlord} />
                </div>
            </div>
            <div className="m-2 fixed -bottom-2 -right-2 left-54 px-4 py-4 bg-brand flex gap-4 items-center">
                <p className="text-white text-sm">{modeText[isEditing ? "edit" : "preview"].text}</p>
                <Button variant={"outline"} className="m-0!" onClick={() => setIsEditing(prev => !prev)}>{modeText[isEditing ? "edit" : "preview"].button}</Button>
            </div>
        </>
    )
}
"use client";
import Image from "next/image";

import React from "react";
import { Button } from "@heroui/react";
import VerifiedTag from "./VerifiedTag";

type SocialLinks = {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
};

export type ProfileWhiteCardProps = {
  // Content
  name: string;
  location: string;
  bannerUrl?: string;
  avatarUrl?: string;
  verifiedLabel?: string;

  phone?: string;
  email?: string;
  socialLinks?: SocialLinks;

  // Size & base styling
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;

  // Button
  buttonText?: string;
  onButtonClick?: () => void;
};

const ProfileWhiteCardHeader: React.FC<ProfileWhiteCardProps> = ({
  name,
  location,
  bannerUrl = "https://media.licdn.com/dms/image/v2/C4E1BAQHejE82dm4OCQ/company-background_10000/company-background_10000/0/1585342521467/sgs_studentbostder_cover?e=1765134000&v=beta&t=DTgoZND8XqmutdxACi5_xIHAFstruoYr_NoEyxwZkCI",
  avatarUrl = "https://media.licdn.com/dms/image/v2/D4D03AQE_SsByAw7RVg/profile-displayphoto-crop_800_800/B4DZliB2.THsAI-/0/1758286280398?e=1766016000&v=beta&t=i_bmJUDpa6bb3bfQ7aWBbfagTrnjjB8hocv4PwJZg-A",
  verifiedLabel = "Verifierad hyresvärd",

  phone,
  email,
  socialLinks,

  width,
  height,
  className = "",
  style,

  buttonText = "Redigera profil",
  onButtonClick,
}) => {
  const handleClick = () => {
    onButtonClick?.();
  };

  return (
      <div
        className={`
          bg-white rounded-[20px] shadow-md 
          overflow-hidden flex flex-col
          ${className}
        `}
        style={{ width, height, ...style }}
      >
        {/* Banner */}
        <section className="relative z-0 w-full aspect-[1128/191] min-h-[120px] sm:min-h-[160px] lg:min-h-[190px] bg-gray-100">
          <Image
            src={bannerUrl}
            alt="Banner"
            className="object-cover"
          />
    
          {/* Profilbild */}
          <img
            src={avatarUrl}
            alt="Profil"
            className="
              absolute left-8 -bottom-20
              w-[200px] h-[200px] 
              rounded-full border-[6px] border-white 
              object-cover
            "
          />
        </section>
    
        {/* Huvudinnehåll */}
        <section className="pt-24 px-8 pb-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
    
          {/* Vänster kolumn — profilinfo */}
          <div>
            <h2 className="text-2xl font-semibold">{name}</h2>
            <p className="text-s text-gray-600 mt-2">{location}</p>
  
              <div className="mt-4 text-sm">
                <VerifiedTag 
                  bgColor="#0F4D0F"
                  textColor="#FFFFFF"
                  height={18}
                  horizontalPadding={10}
                  className="text-[11px] leading-[13px]"
                />

                
              </div>
          </div>
          {/* Höger kolumn — kontakt */}
          <div className="flex flex-col gap-5">
    
            {/* Översta raden: "Kontakt" + ikoner + knapp */}
            <div className="flex items-center justify-between">
    
              <div className="flex items-center gap-2">
                <p className="font-semibold underline text-[18px]">Kontakt:</p>
    
                {socialLinks?.facebook && (
                  <a href={socialLinks.facebook} target="_blank">
                    <img src="/icons/facebook.svg" className="w-7 h-7" />
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a href={socialLinks.instagram} target="_blank">
                    <img src="/icons/instagram.svg" className="w-7 h-7" />
                  </a>
                )}
                {socialLinks?.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank">
                    <img src="/icons/linkedin.svg" className="w-7 h-7" />
                  </a>
                )}
              </div>
    
              <Button
                type="button"
                onClick={onButtonClick}
                className="
                  bg-[#0F4D0F] text-white rounded-full 
                  px-8 py-2 text-[18px] font-medium
                "
              >
                {buttonText}
              </Button>
            </div>
    
            {/* Kontaktuppgifter */}
            <div className="text-[18px] leading-relaxed">
              {phone && (
                <p>
                  <strong>Telefon: </strong>
                  {phone}
                </p>
              )}
              {email && (
                <p>
                  <strong>E-mail: </strong>
                  {email}
                </p>
              )}
            </div>
          </div>
        </section>
      </div> 
  );
};

export default ProfileWhiteCardHeader;

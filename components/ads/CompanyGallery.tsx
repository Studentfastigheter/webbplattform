"use client";

import { useEffect, useState } from "react";
import { Galleria } from "primereact/galleria";

type CompanyGalleryProps = {
  images: string[] | null | undefined;
  companyName?: string;
};

type GalleryImage = {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  index: number;
};

const itemNavigatorStyle = {
  background: "rgba(255, 255, 255, 0.8)",
  borderRadius: "9999px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.14)",
  color: "#374151",
  height: "2.5rem",
  marginInline: "0.75rem",
  width: "2.5rem",
};

const itemNavigatorIconStyle = {
  color: "#374151",
  height: "1.25rem",
  width: "1.25rem",
};

export default function CompanyGallery({
  images,
  companyName,
}: CompanyGalleryProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[] | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const nextImages = (images ?? []).map((src, index) => ({
      itemImageSrc: src,
      thumbnailImageSrc: src,
      alt: `${companyName ?? "Företaget"} - bild ${index + 1}`,
      index,
    }));

    setGalleryImages(nextImages);
    setActiveIndex(0);
  }, [companyName, images]);

  if (!galleryImages || galleryImages.length === 0) return null;

  const setImage = (index: number) => {
    setActiveIndex((index + galleryImages.length) % galleryImages.length);
  };

  const itemTemplate = (item: GalleryImage) => (
    <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-3xl bg-gray-100">
      <img
        src={item.itemImageSrc}
        alt={item.alt}
        className="h-full w-full object-cover transition-all duration-300"
      />
      <span className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white">
        {item.index + 1} / {galleryImages.length}
      </span>
    </div>
  );

  const thumbnailTemplate = (item: GalleryImage) => (
    <div
      className={`h-full w-full overflow-hidden rounded-xl border-2 transition ${
        item.index === activeIndex
          ? "border-gray-900 opacity-100"
          : "border-transparent opacity-60 hover:opacity-90"
      }`}
    >
      <img
        src={item.thumbnailImageSrc}
        alt={item.alt}
        className="h-full w-full object-cover"
      />
    </div>
  );

  return (
    <section className="w-full">
      <h2 className="mb-5 text-2xl font-bold tracking-tight text-gray-900">
        Alla bilder
      </h2>
      <Galleria
        value={galleryImages}
        activeIndex={activeIndex}
        onItemChange={(event) => setImage(event.index)}
        numVisible={5}
        circular
        autoPlay
        transitionInterval={5000}
        style={{ width: "100%" }}
        showItemNavigators={galleryImages.length > 1}
        showItemNavigatorsOnHover={false}
        showThumbnailNavigators={false}
        showThumbnails={galleryImages.length > 1}
        item={itemTemplate}
        thumbnail={thumbnailTemplate}
        className="company-gallery-galleria company-gallery-slideshow-galleria w-full"
        pt={{
          previousItemButton: {
            "aria-label": "Föregående bild",
            style: itemNavigatorStyle,
          },
          nextItemButton: {
            "aria-label": "Nästa bild",
            style: itemNavigatorStyle,
          },
          previousItemIcon: {
            style: itemNavigatorIconStyle,
          },
          nextItemIcon: {
            style: itemNavigatorIconStyle,
          },
          thumbnailItemsContainer: {
            className: "mx-auto",
          },
          thumbnailItems: {
            className: "justify-center gap-2 pb-2",
          },
          thumbnailItem: {
            className:
              "!flex-none !basis-28 !overflow-hidden !opacity-100",
          },
          thumbnailItemContent: {
            className: "!h-20 !w-28 !overflow-hidden !rounded-xl",
          },
        }}
      />
    </section>
  );
}

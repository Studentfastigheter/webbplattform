import ImageSlideshow from "./ImageSlideshow";

type CompanyGalleryProps = {
  images: string[] | null | undefined;
  companyName?: string;
};

export default function CompanyGallery({
  images,
  companyName,
}: CompanyGalleryProps) {
  const galleryImages = images ?? [];

  return (
    <ImageSlideshow
      images={galleryImages}
      title={companyName ?? "Företaget"}
    />
  );
}

import Annons from "@/app/(business_portal)/_pages/annons";
import { use } from "react";


type AnnonsPageProps = {
    params: Promise<{ id: string }>;
};

export default function AnnonsPage({
    params,
}: AnnonsPageProps) {
    
    const { id } = use(params);

  return (
    <Annons id={id} />
  )
}
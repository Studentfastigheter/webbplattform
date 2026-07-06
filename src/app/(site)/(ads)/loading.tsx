import { Loader } from "@/components/ui/loader";

/**
 * Generell fallback för sidor i (ads)-gruppen som saknar egen loading.tsx
 * (sparade, mina annonser, meddelanden m.fl.) så att navigeringen alltid
 * svarar direkt även om serverrenderingen dröjer.
 */
export default function Loading() {
  return (
    <main className="flex min-h-[400px] w-full items-center justify-center py-16">
      <Loader />
    </main>
  );
}

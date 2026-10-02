import { notFound } from "next/navigation";
import { AreaHeading } from "@/components/store/AreaHeading";
import { CartDock } from "@/components/store/CartDock";
import { GalleryTuner } from "@/components/store/GalleryTuner";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreHeader } from "@/components/store/StoreHeader";
import { VisitPills, type VisitTarget } from "@/components/store/VisitPills";
import { AREA_TONES } from "@/lib/store/area-tones";
import { getActiveStoreProducts, getActiveStoreVendors } from "@/lib/store/catalog-server";

const COPY: Record<string, { title: string; blurb: string }> = {
  aisle: { title: "The Aisle", blurb: "Be careful when reaching for the upper shelves!" },
  fruits: { title: "The Fruits", blurb: "Everything here was picked this morning." },
  fridge: { title: "The Fridge", blurb: "Mind the cold — shut the door behind you." },
};

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const [products, vendors] = await Promise.all([getActiveStoreProducts(), getActiveStoreVendors()]);
  const vendor = vendors.find((vendor) => vendor.slug === area);
  if (!vendor) notFound();

  const vendorProducts = products.filter((product) => product.vendorSlug === vendor.slug);
  const artFor = (slug: string) => {
    const first = products.find((product) => product.vendorSlug === slug);
    return `/store/products/${first?.imageFilename ?? `${first?.id}.svg`}`;
  };

  // The other areas, for the "pay a visit to" pills.
  const others: VisitTarget[] = vendors
    .filter((other) => other.slug !== vendor.slug)
    .map((other) => ({ id: other.slug, name: other.name, image: artFor(other.slug), tone: AREA_TONES[other.slug] ?? "lilac" }));

  const copy = COPY[vendor.slug] ?? { title: vendor.name, blurb: "" };

  return (
    <div className="storePage">
      <StoreHeader showCart />
      <main className={`storeMain shopMain shopMain--${AREA_TONES[vendor.slug] ?? "lilac"}`}>
        <div className="shopTop">
          <AreaHeading title={copy.title} blurb={copy.blurb} />
          <VisitPills targets={others} />
        </div>
        <div className="shopGrid">
          {vendorProducts.map((product) => (
            <ProductCard key={product.id} product={product} areaId={vendor.slug} />
          ))}
        </div>
      </main>
      <CartDock />
      <GalleryTuner />
    </div>
  );
}

import { MarketSelector, type MarketSection } from "@/components/store/MarketSelector";
import { StoreHeader } from "@/components/store/StoreHeader";
import { getActiveStoreVendors } from "@/lib/store/catalog-server";

/** Copy for the three market areas, from the design. */
const BLURBS: Record<string, string> = {
  aisle: "Non-perishables & essentials",
  fruits: "Fresh tasty berries & assorted produce",
  fridge: "Anything that needs cold temps",
};

export default async function MarketPage() {
  const vendors = await getActiveStoreVendors();
  const sections: MarketSection[] = vendors.map((vendor) => ({
    slug: vendor.slug,
    name: vendor.name,
    blurb: BLURBS[vendor.slug] ?? "Wholesale ingredients and supplies",
  }));

  return (
    <div className="storePage">
      <StoreHeader />

      <main className="storeMain storeMain--market">
        <section className="storeIntro">
          <h1 className="storeHeading">Welcome to the Market</h1>
          <p className="storeBody">
            Explore different areas to grab ingredients. Be sure to take a look at everything!
          </p>
        </section>

        <MarketSelector sections={sections} />
      </main>
    </div>
  );
}

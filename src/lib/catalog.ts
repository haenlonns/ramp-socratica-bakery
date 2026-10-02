export type Product = {
  id: string;
  name: string;
  description: string;
  unit: string;
  priceCents: number;
  emoji: string;
  /** Set to false to mark a product sold out; checkout then refuses it. */
  inStock?: boolean;
};

export type Vendor = {
  /** Stable identifier shared by the storefront route, API, and database. */
  slug: string;
  name: string;
  invoicePrefix: string;
  catalog: Product[];
};

/**
 * The deployment-level store registry. A frontend redesign must add each
 * store's slug, display name, invoice prefix, and server-owned catalogue here,
 * then seed the matching slug in `vendors` through a migration.
 */
export const vendors: Vendor[] = [
  {
    slug: "aisle",
    name: "Aisle",
    invoicePrefix: "AIS",
    catalog: [
      { id: "granola", name: "Granola (gf, nf)", description: "crunchy, gluten-free and nut-free. sourced from Wart Mart.", unit: "bag", priceCents: 1500, emoji: "\u{1F33E}" },
      { id: "trail-mix", name: "Trail mix", description: "a handful of everything good. sourced from Wart Mart.", unit: "bag", priceCents: 1300, emoji: "\u{1F95C}" },
      { id: "graham-cracker", name: "Graham cracker", description: "snaps cleanly in half. sourced from Wart Mart.", unit: "box", priceCents: 600, emoji: "\u{1F36A}" },
      { id: "castella-cake", name: "Castella cake", description: "freshly baked in the great kingdom of Ontario. sourced from Wart Mart.", unit: "cake", priceCents: 2400, emoji: "\u{1F370}" },
      { id: "brown-sugar", name: "Brown sugar", description: "soft, sticky and a little bit molasses. sourced from Wart Mart.", unit: "bag", priceCents: 700, emoji: "\u{1F36F}" },
      { id: "cinnamon", name: "Cinnamon", description: "rolled sticks from a faraway spice shelf. sourced from Wart Mart.", unit: "jar", priceCents: 800, emoji: "\u{1F33F}" },
      { id: "nutmeg", name: "Nutmeg", description: "grate it fresh over anything warm. sourced from Wart Mart.", unit: "jar", priceCents: 900, emoji: "\u{1F330}" },
    ],
  },
  {
    slug: "fruits",
    name: "Fruits",
    invoicePrefix: "FRU",
    catalog: [
      { id: "blackberry", name: "Blackberry", description: "dark, juicy and just a bit tart. picked this morning.", unit: "punnet", priceCents: 1200, emoji: "\u{1FAD0}" },
      { id: "blueberry", name: "Blueberry", description: "small, sweet and very round. picked this morning.", unit: "punnet", priceCents: 1100, emoji: "\u{1FAD0}" },
      { id: "raspberry", name: "Raspberry", description: "delicate and bright. handle with care.", unit: "punnet", priceCents: 1300, emoji: "\u{1F353}" },
      { id: "strawberry", name: "Strawberry", description: "ripe, red and ready for cake. picked this morning.", unit: "punnet", priceCents: 900, emoji: "\u{1F353}" },
    ],
  },
  {
    slug: "fridge",
    name: "Fridge",
    invoicePrefix: "FRD",
    catalog: [
      { id: "yogurt", name: "Yogurt", description: "thick, cold and a little tangy. kept chilled.", unit: "tub", priceCents: 1000, emoji: "\u{1F95B}" },
      { id: "honey", name: "Honey", description: "golden and slow to pour. kept chilled.", unit: "jar", priceCents: 1400, emoji: "\u{1F36F}" },
      { id: "whipping-cream", name: "Whipping cream", description: "whips up soft and tall. kept chilled.", unit: "carton", priceCents: 800, emoji: "\u{1F95B}" },
      { id: "creamer", name: "Creamer", description: "for the coffee that needs a little extra. kept chilled.", unit: "jug", priceCents: 700, emoji: "\u{1F95B}" },
      { id: "pumpkin-puree", name: "Pumpkin puree", description: "smooth and earthy, straight from the can. kept chilled.", unit: "can", priceCents: 600, emoji: "\u{1F383}" },
      { id: "condensed-milk", name: "Condensed milk", description: "sweet, thick and shamelessly rich. kept chilled.", unit: "can", priceCents: 500, emoji: "\u{1F95B}" },
    ],
  },
];

export const vendorsBySlug = new Map(vendors.map((vendor) => [vendor.slug, vendor]));

export function getVendor(slug: string) {
  return vendorsBySlug.get(slug);
}

/**
 * Cross-vendor product lookup. A cart can hold items from several stores, so
 * pricing and rendering need an id -> product map spanning the whole registry.
 * Product ids are unique across vendors.
 */
/** Every product across the registry, for pickers and admin UI. */
export const allProducts: Product[] = vendors.flatMap((vendor) => vendor.catalog);

export const productsById = new Map(
  vendors.flatMap((vendor) => vendor.catalog.map((product) => [product.id, product] as const)),
);

export function getProduct(id: string) {
  return productsById.get(id);
}

/** Which store sells a given product. */
export function vendorForProduct(id: string) {
  return vendors.find((vendor) => vendor.catalog.some((product) => product.id === id));
}

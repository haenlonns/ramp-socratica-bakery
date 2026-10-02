export type Product = {
  id: string;
  name: string;
  description: string;
  unit: string;
  priceCents: number;
  /** Maximum lifetime quantity a team may purchase. */
  perTeamLimit: number;
  /** Remaining global stock available to all teams. */
  inventoryQuantity: number;
  emoji: string;
  /** Filename in public/store/products, selected by an administrator. */
  imageFilename?: string;
};

/**
 * The workshop catalogue displayed by the market. Prices are expressed in
 * cents and remain server-owned when an order is created. This is also the
 * fallback when the database catalogue is unavailable, so each item carries
 * the market area it is sold in.
 */
type SeedProduct = Omit<Product, "perTeamLimit" | "inventoryQuantity" | "imageFilename"> & { area: "aisle" | "fruits" | "fridge" };

const seed: SeedProduct[] = [
  { area: "aisle", id: "granola", name: "Granola (gf, nf)", description: "crunchy, gluten-free and nut-free. sourced from Wart Mart.", unit: "bag", priceCents: 1500, emoji: "\u{1F33E}" },
  { area: "aisle", id: "trail-mix", name: "Trail mix", description: "a handful of everything good. sourced from Wart Mart.", unit: "bag", priceCents: 1300, emoji: "\u{1F95C}" },
  { area: "aisle", id: "graham-cracker", name: "Graham cracker", description: "snaps cleanly in half. sourced from Wart Mart.", unit: "box", priceCents: 600, emoji: "\u{1F36A}" },
  { area: "aisle", id: "castella-cake", name: "Castella cake", description: "freshly baked in the great kingdom of Ontario. sourced from Wart Mart.", unit: "cake", priceCents: 2400, emoji: "\u{1F370}" },
  { area: "aisle", id: "brown-sugar", name: "Brown sugar", description: "soft, sticky and a little bit molasses. sourced from Wart Mart.", unit: "bag", priceCents: 700, emoji: "\u{1F36F}" },
  { area: "aisle", id: "cinnamon", name: "Cinnamon", description: "rolled sticks from a faraway spice shelf. sourced from Wart Mart.", unit: "jar", priceCents: 800, emoji: "\u{1F33F}" },
  { area: "aisle", id: "nutmeg", name: "Nutmeg", description: "grate it fresh over anything warm. sourced from Wart Mart.", unit: "jar", priceCents: 900, emoji: "\u{1F330}" },
  { area: "fruits", id: "blackberry", name: "Blackberry", description: "dark, juicy and just a bit tart. picked this morning.", unit: "punnet", priceCents: 1200, emoji: "\u{1FAD0}" },
  { area: "fruits", id: "blueberry", name: "Blueberry", description: "small, sweet and very round. picked this morning.", unit: "punnet", priceCents: 1100, emoji: "\u{1FAD0}" },
  { area: "fruits", id: "raspberry", name: "Raspberry", description: "delicate and bright. handle with care.", unit: "punnet", priceCents: 1300, emoji: "\u{1F353}" },
  { area: "fruits", id: "strawberry", name: "Strawberry", description: "ripe, red and ready for cake. picked this morning.", unit: "punnet", priceCents: 900, emoji: "\u{1F353}" },
  { area: "fridge", id: "yogurt", name: "Yogurt", description: "thick, cold and a little tangy. kept chilled.", unit: "tub", priceCents: 1000, emoji: "\u{1F95B}" },
  { area: "fridge", id: "honey", name: "Honey", description: "golden and slow to pour. kept chilled.", unit: "jar", priceCents: 1400, emoji: "\u{1F36F}" },
  { area: "fridge", id: "whipping-cream", name: "Whipping cream", description: "whips up soft and tall. kept chilled.", unit: "carton", priceCents: 800, emoji: "\u{1F95B}" },
  { area: "fridge", id: "creamer", name: "Creamer", description: "for the coffee that needs a little extra. kept chilled.", unit: "jug", priceCents: 700, emoji: "\u{1F95B}" },
  { area: "fridge", id: "pumpkin-puree", name: "Pumpkin puree", description: "smooth and earthy, straight from the can. kept chilled.", unit: "can", priceCents: 600, emoji: "\u{1F383}" },
  { area: "fridge", id: "condensed-milk", name: "Condensed milk", description: "sweet, thick and shamelessly rich. kept chilled.", unit: "can", priceCents: 500, emoji: "\u{1F95B}" },
];

export const catalog: Product[] = seed.map(({ area: _area, ...product }) => ({
  ...product,
  perTeamLimit: 4,
  inventoryQuantity: 24,
  imageFilename: `${product.id}.svg`,
}));

export const catalogById = new Map(catalog.map((product) => [product.id, product]));

/** Fallback market areas, used only when the database catalogue is unavailable. */
export const fallbackVendors = [
  { slug: "aisle", name: "Aisle" },
  { slug: "fruits", name: "Fruits" },
  { slug: "fridge", name: "Fridge" },
] as const;

export const fallbackAreaById = new Map(seed.map((product) => [product.id, product.area]));

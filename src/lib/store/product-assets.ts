/**
 * The Worker cannot read the deployment filesystem at runtime. Keep this
 * reviewed manifest in sync with `public/store/products/` as art is added.
 */
export const productImageAssets = [
  "blackberry.svg",
  "blueberry.svg",
  "brown-sugar.svg",
  "castella-cake.svg",
  "cinnamon.svg",
  "condensed-milk.svg",
  "creamer.svg",
  "graham-cracker.svg",
  "granola.svg",
  "honey.svg",
  "nutmeg.svg",
  "pumpkin-puree.svg",
  "raspberry.svg",
  "strawberry.svg",
  "trail-mix.svg",
  "whipping-cream.svg",
  "yogurt.svg",
] as const;

export type ProductImageAsset = (typeof productImageAssets)[number];

export function isProductImageAsset(value: string): value is ProductImageAsset {
  return productImageAssets.includes(value as ProductImageAsset);
}

/** Accent tone per market area. Drives `.shopMain--<tone>` in store.css. */
export type AreaTone = "lilac" | "peach" | "mint";

export const AREA_TONES: Record<string, AreaTone> = {
  aisle: "mint",
  fruits: "peach",
  fridge: "lilac",
};

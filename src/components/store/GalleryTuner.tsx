"use client";

import { StoreSliders } from "./StoreSliders";

/** Sliders for the gallery (/store/market/[area]) page only. */
export function GalleryTuner() {
  return (
    <StoreSliders
      title="Gallery page"
      controls={[
        { prop: "gallery-subtitle-size", label: "Subtitle size", min: 10, max: 20, step: 0.5, value: 16, unit: "px" },
        { prop: "gallery-pill-gap", label: "Pill gap", min: 4, max: 32, step: 1, value: 16, unit: "px" },
        { prop: "gallery-pill-pad-y", label: "Pill pad Y", min: 6, max: 24, step: 0.5, value: 6, unit: "px" },
        { prop: "gallery-pill-pad-x", label: "Pill pad X", min: 6, max: 32, step: 0.5, value: 20, unit: "px" },
        { prop: "gallery-grid-top", label: "Grid top gap", min: 8, max: 80, step: 1, value: 29, unit: "px" },
        { prop: "gallery-grid-gap", label: "Grid gap", min: 8, max: 64, step: 1, value: 32.5, unit: "px" },
        { prop: "gallery-card-radius", label: "Card radius", min: 0, max: 32, step: 1, value: 12, unit: "px" },
        { prop: "gallery-info-pad-y", label: "Info pad Y", min: 6, max: 32, step: 1, value: 14, unit: "px" },
        { prop: "gallery-info-pad-x", label: "Info pad X", min: 6, max: 36, step: 1, value: 17, unit: "px" },
        { prop: "gallery-product-scale", label: "Product size", min: 0.6, max: 1.4, step: 0.02, value: 1 },
      ]}
    />
  );
}

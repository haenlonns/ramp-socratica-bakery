"use client";

import { Sheet } from "@/components/ui/Sheet";
import { useSheetParam } from "@/lib/use-sheet-param";
import { ProductDetail } from "./ProductDetail";
import { useStoreCart } from "./StoreCart";

/** Product detail over the gallery, driven by `?item=<id>`. */
export function ProductSheet() {
  const { value, close } = useSheetParam("item");
  const { productsById } = useStoreCart();
  const product = value ? productsById.get(value) : undefined;

  return (
    <Sheet open={product !== undefined} onClose={close} label={product?.name ?? "Product"}>
      {product && <ProductDetail key={product.id} product={product} />}
    </Sheet>
  );
}

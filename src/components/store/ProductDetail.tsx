"use client";

import { useState } from "react";
import type { StoreProduct } from "@/lib/store/catalog-server";
import { Button } from "@/components/ui/Button";
import { PricePill } from "@/components/ui/PricePill";
import { AllergenAlert } from "./AllergenAlert";
import { QuantityStepper } from "./QuantityStepper";
import { useStoreCart } from "./StoreCart";
import { Grain } from "./Grain";

/** Product sheet content: image, copy, price, quantity, add to cart, allergens. */
export function ProductDetail({
  product,
  allergens = "Baked in a facility that uses soy.",
}: {
  product: StoreProduct;
  allergens?: string;
}) {
  const { lines, setQuantity: setCartQuantity } = useStoreCart();
  const soldOut = product.inventoryQuantity === 0;
  const limit = product.perTeamLimit;
  const maximum = Math.min(limit, product.inventoryQuantity);
  const inCart = lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  // The stepper edits a draft target; with no draft it mirrors the cart.
  const [draft, setDraft] = useState<number | null>(null);
  const quantity = Math.max(1, Math.min(draft ?? (inCart || 1), Math.max(maximum, 1)));
  const [flash, setFlash] = useState<string | null>(null);

  const changed = inCart === 0 || quantity !== inCart;
  const label = soldOut ? "Sold out" : flash ?? (inCart === 0 ? "Add to Cart" : changed ? "Update in cart" : "In cart");

  function commit() {
    if (soldOut) return;
    setCartQuantity(product.id, quantity);
    setDraft(null);
    setFlash(inCart === 0 ? "Added" : "Updated");
    window.setTimeout(() => setFlash(null), 1400);
  }

  return (
    <div className="shopDetail">
      <div className="shopDetailGrid">
        <div className="shopDetailInfo">
          <div className="shopDetailTop">
            <div className="shopDetailCopy">
              <h1 className="shopDetailName">{product.name}</h1>
              <p className="shopDetailDesc">{product.description}</p>
            </div>
            <PricePill cents={product.priceCents} size="lg" soldOut={soldOut} />
          </div>

          <div className="shopDetailActions">
            <div className="shopDetailBuy">
              {!soldOut && (
                <div className="shopQuantityRow">
                  <div>
                    <p className="shopQuantityLabel">Quantity</p>
                    <p className="shopQuantityLimit">Limit of {limit} per team.</p>
                  </div>
                  <QuantityStepper value={quantity} max={maximum} onChange={setDraft} />
                </div>
              )}
              <Button block onClick={commit} disabled={soldOut || !changed}>
                {label}
              </Button>
            </div>

            <AllergenAlert body={allergens} />
          </div>
        </div>

        <div className="shopDetailArt">
          <img src={`/store/products/${product.imageFilename ?? `${product.id}.svg`}`} alt={product.name} />
          <Grain />
        </div>
      </div>
    </div>
  );
}

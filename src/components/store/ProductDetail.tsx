"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { AllergenAlert } from "./AllergenAlert";
import { QuantityStepper } from "./QuantityStepper";
import { useStoreCart } from "./StoreCart";
import { Grain } from "./Grain";

const money = (cents: number) =>
  cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;

export function ProductDetail({
  product,
  areaId,
  perTeamLimit,
  allergens = "Baked in a facility that uses soy.",
}: {
  product: Product;
  areaId: string;
  /** Overrides the product's own limit; mostly for previews. */
  perTeamLimit?: number;
  allergens?: string;
}) {
  const { lines, setQuantity: setCartQuantity } = useStoreCart();
  const soldOut = product.inventoryQuantity === 0;
  const limit = perTeamLimit ?? product.perTeamLimit;
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
      <Link href={`/store/market/${areaId}`} className="shopBack">Back</Link>

      <div className="shopDetailGrid">
        <div className="shopDetailInfo">
          <div className="shopDetailTop">
            <h1 className="shopDetailName">{product.name}</h1>
            <p className="shopDetailDesc">{product.description}</p>
            <span className="shopDetailPrice">{soldOut ? "Sold out" : money(product.priceCents)}</span>
          </div>

          <div className="shopDetailActions">
            {!soldOut && <div className="shopQuantityRow">
              <div>
                <p className="shopQuantityLabel">Quantity</p>
                <p className="shopQuantityLimit">Limit of {limit} per team.</p>
              </div>
              <QuantityStepper value={quantity} max={maximum} onChange={setDraft} />
            </div>}

            <button type="button" className="shopAddToCart" onClick={commit} disabled={soldOut || !changed}>
              {label}
            </button>

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

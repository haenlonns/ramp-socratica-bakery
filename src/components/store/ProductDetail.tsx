"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { PER_TEAM_LIMIT } from "@/lib/store/cart";
import { AllergenAlert } from "./AllergenAlert";
import { QuantityStepper } from "./QuantityStepper";
import { useStoreCart } from "./StoreCart";
import { Grain } from "./Grain";

const money = (cents: number) =>
  cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;

export function ProductDetail({
  product,
  areaId,
  allergens = "Baked in a facility that uses soy.",
}: {
  product: Product;
  areaId: string;
  allergens?: string;
}) {
  const { lines, setQuantity: setCartQuantity } = useStoreCart();
  const inCart = lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  // The stepper edits a draft target; with no draft it mirrors the cart.
  const [draft, setDraft] = useState<number | null>(null);
  const quantity = draft ?? (inCart || 1);
  const [flash, setFlash] = useState<string | null>(null);

  const changed = inCart === 0 || quantity !== inCart;
  const label = flash ?? (inCart === 0 ? "Add to Cart" : changed ? "Update in cart" : "In cart");

  function commit() {
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
            <span className="shopDetailPrice">{money(product.priceCents)}</span>
          </div>

          <div className="shopDetailActions">
            <div className="shopQuantityRow">
              <div>
                <p className="shopQuantityLabel">Quantity</p>
                <p className="shopQuantityLimit">Limit of {PER_TEAM_LIMIT} per team.</p>
              </div>
              <QuantityStepper value={quantity} max={PER_TEAM_LIMIT} onChange={setDraft} />
            </div>

            <button type="button" className="shopAddToCart" onClick={commit} disabled={!changed}>
              {label}
            </button>

            <AllergenAlert body={allergens} />
          </div>
        </div>

        <div className="shopDetailArt">
          <img src={`/store/products/${product.id}.svg`} alt={product.name} />
          <Grain />
        </div>
      </div>
    </div>
  );
}

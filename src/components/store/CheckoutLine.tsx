"use client";

import type { Product } from "@/lib/catalog";
import { QuantityStepper } from "./QuantityStepper";
import { useStoreCart } from "./StoreCart";
import { GrainImage } from "./GrainImage";

const money = (cents: number) =>
  cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;

export function CheckoutLine({ product, quantity }: { product: Product; quantity: number }) {
  const { add, remove } = useStoreCart();

  return (
    <li className="checkoutLine">
      <div className="checkoutItem">
        <GrainImage className="checkoutThumb" src={`/store/products/${product.imageFilename ?? `${product.id}.svg`}`} />
        <span className="checkoutName">{product.name}</span>
      </div>

      <div className="checkoutRight">
        <QuantityStepper
          value={quantity}
          min={0}
          max={Math.min(product.perTeamLimit, product.inventoryQuantity)}
          onChange={(next) => (next > quantity ? add(product.id) : remove(product.id))}
        />
        <span className="checkoutPrice">{money(product.priceCents * quantity)}</span>
      </div>
    </li>
  );
}

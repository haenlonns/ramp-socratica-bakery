"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { useStoreCart } from "./StoreCart";
import { Grain } from "./Grain";

const money = (cents: number) =>
  cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;

export function ProductCard({ product, areaId }: { product: Product; areaId: string }) {
  const { add, lines } = useStoreCart();
  const soldOut = product.inventoryQuantity === 0;
  const limit = Math.min(product.perTeamLimit, product.inventoryQuantity);
  const atLimit = (lines.find((line) => line.productId === product.id)?.quantity ?? 0) >= limit;

  return (
    <article className={soldOut ? "shopCard shopCard--soldOut" : "shopCard"}>
      <Link
        href={`/store/market/${areaId}/${product.id}`}
        className="shopCardArt"
        aria-label={`View ${product.name}`}
      >
        <img src={`/store/products/${product.imageFilename ?? `${product.id}.svg`}`} alt="" aria-hidden />
        <Grain />
      </Link>

      <div className="shopCardInfo">
        <div className="shopCardText">
          <h2 className="shopCardName">{product.name}</h2>
          <p className="shopCardDesc">{product.description}</p>
        </div>
        <button
          type="button"
          className="shopPrice"
          onClick={() => add(product.id)}
          disabled={soldOut || atLimit}
          aria-label={
            soldOut
              ? `${product.name} is sold out`
              : atLimit
                ? `${product.name}: limit of ${limit} reached`
                : `Add ${product.name} to cart`
          }
        >
          {soldOut ? "Sold out" : money(product.priceCents)}
        </button>
      </div>
    </article>
  );
}

"use client";

import Link from "next/link";
import type { StoreProduct } from "@/lib/store/catalog-server";
import { PricePill } from "@/components/ui/PricePill";
import { markSheetOpened } from "@/lib/use-sheet-param";
import { Grain } from "./Grain";

/** The whole card is a link: it opens the product sheet at `?item=<id>`. */
export function ProductCard({ product }: { product: StoreProduct }) {
  const soldOut = product.inventoryQuantity === 0;

  return (
    <Link
      href={`?item=${product.id}`}
      scroll={false}
      onClick={markSheetOpened}
      className={soldOut ? "shopCard shopCard--soldOut" : "shopCard"}
      aria-label={`${product.name}, view details`}
    >
      <span className="shopCardArt">
        <img src={`/store/products/${product.imageFilename ?? `${product.id}.svg`}`} alt="" aria-hidden />
        <Grain />
      </span>

      <span className="shopCardInfo">
        <span className="shopCardText">
          <h2 className="shopCardName">{product.name}</h2>
          <p className="shopCardDesc">{product.description}</p>
        </span>
        <PricePill cents={product.priceCents} soldOut={soldOut} />
      </span>
    </Link>
  );
}

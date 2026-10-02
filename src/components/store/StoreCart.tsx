"use client";

import { createContext, useCallback, useContext, useMemo, useOptimistic, useTransition } from "react";
import { addToCart, removeFromCart, setCartQuantity } from "@/app/(store)/cart-actions";
import { applyCartChange, cartTotals, type CartLine } from "@/lib/store/cart";
import type { StoreProduct } from "@/lib/store/catalog-server";

type Change = { type: "add" | "remove" | "set"; productId: string; quantity?: number };

type Ctx = {
  lines: CartLine[];
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  count: number;
  totalCents: number;
  pending: boolean;
  productsById: Map<string, StoreProduct>;
};

const CartContext = createContext<Ctx | null>(null);

/**
 * Server-owned cart with optimistic client updates.
 *
 * `lines` comes from the cookie via a Server Component, so the first paint is
 * already correct. `useOptimistic` applies the same reducer the server runs, so
 * a click feels instant and then reconciles when the action returns.
 */
export function StoreCartProvider({ lines, products, children }: { lines: CartLine[]; products: StoreProduct[]; children: React.ReactNode }) {
  const [optimisticLines, applyOptimistic] = useOptimistic(lines, (state: CartLine[], change: Change) =>
    applyCartChange(state, change, new Set(products.map((product) => product.id))),
  );
  const [pending, startTransition] = useTransition();

  const add = useCallback(
    (productId: string, quantity = 1) => {
      startTransition(async () => {
        applyOptimistic({ type: "add", productId, quantity });
        await addToCart(productId, quantity);
      });
    },
    [applyOptimistic],
  );

  const remove = useCallback(
    (productId: string, quantity = 1) => {
      startTransition(async () => {
        applyOptimistic({ type: "remove", productId, quantity });
        await removeFromCart(productId, quantity);
      });
    },
    [applyOptimistic],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      startTransition(async () => {
        applyOptimistic({ type: "set", productId, quantity });
        await setCartQuantity(productId, quantity);
      });
    },
    [applyOptimistic],
  );

  const value = useMemo(() => {
    const { count, totalCents } = cartTotals(optimisticLines, products);
    return { lines: optimisticLines, add, remove, setQuantity, count, totalCents, pending, productsById: new Map(products.map((product) => [product.id, product])) };
  }, [optimisticLines, add, remove, setQuantity, pending, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useStoreCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useStoreCart must be used inside StoreCartProvider");
  return ctx;
}

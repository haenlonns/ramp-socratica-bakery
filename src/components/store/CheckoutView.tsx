"use client";

import { completeOrder } from "@/app/(store)/cart-actions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { productsById } from "@/lib/catalog";
import { activeTeam } from "@/lib/ramp/config";
import { CartSummary } from "./CartSummary";
import { CheckoutLine } from "./CheckoutLine";
import { useRampConfig } from "@/components/ramp/RampConfigProvider";
import { recordPurchase, spentCents, usePurchases } from "@/lib/store/purchases";
import { useStoreCart } from "./StoreCart";

const PAY_DELAY_MS = 3000;

export function CheckoutView() {
  const { lines, totalCents } = useStoreCart();
  const { config } = useRampConfig();
  const router = useRouter();
  const purchases = usePurchases();
  const [paying, setPaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Don't fire the result if the shopper leaves while it is loading.
  useEffect(() => () => clearTimeout(timer.current), []);

  const rows = lines
    .map((line) => ({ product: productsById.get(line.productId), quantity: line.quantity }))
    .filter((row): row is { product: NonNullable<typeof row.product>; quantity: number } =>
      Boolean(row.product),
    );

  // What is left on the card after everything already bought in the store.
  const remainingCents = (activeTeam(config).cards[0]?.remainingCents ?? 0) - spentCents(purchases);
  const soldOut = rows.some((row) => productsById.get(row.product.id)?.inStock === false);

  function pay() {
    // Dev-only: /store/cart?fail=budget|stock previews a failure.
    const forced =
      process.env.NODE_ENV === "development"
        ? new URLSearchParams(window.location.search).get("fail")
        : null;
    const failure = forced === "budget" || forced === "stock" ? forced : soldOut ? "stock" : totalCents > remainingCents ? "budget" : null;

    // Show a 3-second loading state, then land on the outcome. The receipt
    // page carries the failure copy; a failed payment leaves the cart untouched.
    setPaying(true);
    timer.current = setTimeout(() => {
      if (failure) router.push(`/store/receipt?status=${failure}`);
      else {
        recordPurchase(lines.map((line) => ({ productId: line.productId, quantity: line.quantity })), totalCents);
        completeOrder();
      }
    }, PAY_DELAY_MS);
  }

  return (
    <div className="checkout">
      <div className="checkoutGrid">
        <section className="checkoutCart">
          <h1 className="storeDisplay">Shopping Cart</h1>

          <div className="checkoutCard">
            {rows.length === 0 ? (
              <p className="checkoutEmpty">Your cart is empty. Head back to the market to add something.</p>
            ) : (
              <ul className="checkoutLines">
                {rows.map((row) => (
                  <CheckoutLine key={row.product.id} product={row.product} quantity={row.quantity} />
                ))}
              </ul>
            )}
          </div>
        </section>

        <CartSummary
          subtotalCents={totalCents}
          totalCents={totalCents}
          disabled={rows.length === 0}
          onPayWithRamp={pay}
          loading={paying}
        />
      </div>

    </div>
  );
}

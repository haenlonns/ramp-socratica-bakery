"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { completeOrder } from "@/app/(store)/cart-actions";
import { activeTeam } from "@/lib/ramp/config";
import { recordPurchase, removePurchase, spentCents, usePurchases } from "@/lib/store/purchases";
import { useRampConfig } from "@/components/ramp/RampConfigProvider";
import { CartSummary } from "./CartSummary";
import { CheckoutLine } from "./CheckoutLine";
import { useStoreCart } from "./StoreCart";

const PAY_DELAY_MS = 3000;

type Failure = "budget" | "stock";

export function CheckoutView() {
  const { lines, totalCents, productsById } = useStoreCart();
  const { config } = useRampConfig();
  const router = useRouter();
  const purchases = usePurchases();
  const [paying, setPaying] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
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
  const soldOut = rows.some((row) => row.quantity > row.product.inventoryQuantity);

  function pay() {
    setCheckoutError("");
    // Dev-only: /store/cart?fail=budget|stock previews a failure.
    const forced =
      process.env.NODE_ENV === "development"
        ? new URLSearchParams(window.location.search).get("fail")
        : null;
    const failure: Failure | null =
      forced === "budget" || forced === "stock" ? forced : soldOut ? "stock" : totalCents > remainingCents ? "budget" : null;

    // Show a 3-second loading state, then land on the outcome. The receipt
    // page carries the failure copy; a failed payment leaves the cart untouched.
    setPaying(true);
    timer.current = setTimeout(async () => {
      if (failure) {
        router.push(`/store/receipt?status=${failure}`);
        return;
      }

      const id = recordPurchase(
        lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        totalCents,
      );
      try {
        await completeOrder();
      } catch (error) {
        // The server is the authority: stock or funds can still run out between
        // the click and the order, so show the matching outcome.
        removePurchase(id);
        const message = error instanceof Error ? error.message : "Unable to complete this checkout.";
        if (/stock|sold out/i.test(message)) router.push("/store/receipt?status=stock");
        else if (/fund|budget|balance|insufficient/i.test(message)) router.push("/store/receipt?status=budget");
        else {
          setCheckoutError(message);
          setPaying(false);
        }
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

        <div>
          {checkoutError && <p className="error" role="alert">{checkoutError}</p>}
          <CartSummary
            subtotalCents={totalCents}
            totalCents={totalCents}
            disabled={rows.length === 0}
            onPayWithRamp={pay}
            loading={paying}
          />
        </div>
      </div>
    </div>
  );
}

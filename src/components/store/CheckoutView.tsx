"use client";

import { completeOrder } from "@/app/(store)/cart-actions";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { productsById } from "@/lib/catalog";
import { CartSummary } from "./CartSummary";
import { CheckoutLine } from "./CheckoutLine";
import { useStoreCart } from "./StoreCart";

const PAY_DELAY_MS = 3000;

export function CheckoutView() {
  const { lines, totalCents } = useStoreCart();
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Don't fire the result if the shopper leaves while it is loading.
  useEffect(() => () => clearTimeout(timer.current), []);

  const rows = lines
    .map((line) => ({ product: productsById.get(line.productId), quantity: line.quantity }))
    .filter((row): row is { product: NonNullable<typeof row.product>; quantity: number } =>
      Boolean(row.product),
    );

  function pay() {
    if (paying) return;
    setPaymentError("");
    // Dev-only: /store/cart?fail=budget|stock previews a failure.
    const forced =
      process.env.NODE_ENV === "development"
        ? new URLSearchParams(window.location.search).get("fail")
        : null;
    const failure = forced === "budget" || forced === "stock" ? forced : null;

    // Show a 3-second loading state, then land on the outcome. The receipt
    // page carries the failure copy; a failed payment leaves the cart untouched.
    setPaying(true);
    timer.current = setTimeout(() => {
      if (failure) router.push(`/store/receipt?status=${failure}`);
      else {
        startTransition(async () => {
          try {
            await completeOrder();
          } catch (error) {
            // A redirect from the Server Action is handled by Next.js. All
            // ordinary checkout failures must return control to the shopper.
            if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
            setPaymentError(error instanceof Error ? error.message : "Unable to process payment. Please try again.");
            setPaying(false);
          }
        });
      }
    }, PAY_DELAY_MS);
  }

  return (
    <div className="checkout">
      <div className="checkoutGrid">
        <section className="checkoutCart">
          <h1 className="storeDisplay">Shopping Cart</h1>

          {paymentError && <p className="checkoutError" role="alert">{paymentError}</p>}

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

"use client";

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function CartSummary({
  subtotalCents,
  totalCents,
  onPayWithRamp,
  disabled,
  loading = false,
}: {
  subtotalCents: number;
  totalCents: number;
  onPayWithRamp?: () => void;
  disabled?: boolean;
  /** Payment in flight: swaps the label for a spinner and blocks clicks. */
  loading?: boolean;
}) {
  return (
    <aside className="checkoutSummary">
      <h2 className="storeDisplay">Summary</h2>

      <dl className="checkoutTotals">
        <div className="checkoutSubtotal">
          <dt>Subtotal</dt>
          <dd>{money(subtotalCents)}</dd>
        </div>
        <div className="checkoutTotal">
          <dt>Total</dt>
          <dd>{money(totalCents)}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="checkoutRamp"
        onClick={onPayWithRamp}
        disabled={disabled || loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="checkoutSpinner" aria-hidden />
            <span className="checkoutRampLabel" role="status">Processing payment</span>
          </>
        ) : (
          <>
            <span className="checkoutRampLabel">Pay with</span>
            <span className="checkoutRampMark" role="img" aria-label="Ramp">
              <img src="/store/ramp-pay.png" alt="" aria-hidden />
            </span>
          </>
        )}
      </button>
    </aside>
  );
}

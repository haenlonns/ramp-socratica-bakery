import { Button } from "@/components/ui/Button";

export type ReceiptFailure = "budget" | "stock";

/** Same layout for every outcome; only the words and the way back change. */
const COPY = {
  success: {
    title: "Thank You :)",
    body: "All your items should be delivered to you in about 5 minutes! We look forward to seeing what you create with all of these ingredients.",
    back: { label: "Continue Shopping", href: "/store/market" },
  },
  budget: {
    title: "Out of funds :(",
    body: "Over-budget, no more funds in your account. Take another look at your cart and try again with fewer items.",
    back: { label: "Back to Cart", href: "/store/cart" },
  },
  stock: {
    title: "Out of stock :(",
    body: "One of the items you have selected is out of stock. Swap it out in your cart and try again.",
    back: { label: "Back to Cart", href: "/store/cart" },
  },
} as const;

/** The same four berries on every outcome; they do not reflect the order. */
const BERRIES = ["blueberry", "strawberry", "raspberry", "blackberry"];

export function ReceiptView({ failure }: { failure?: ReceiptFailure }) {
  const copy = COPY[failure ?? "success"];

  return (
    <div className="receipt">
      <div className="receiptText">
        <h1 className="storeDisplay">{copy.title}</h1>
        <p className="receiptBody">{copy.body}</p>
      </div>

      <div className="receiptFoot">
        <ul className="receiptItems" aria-hidden>
          {BERRIES.map((berry) => (
            <li key={berry}>
              <img src={`/store/products/${berry}.svg`} alt="" />
            </li>
          ))}
        </ul>

        <div className="receiptActions">
          <Button href={copy.back.href} variant="tint" block>{copy.back.label}</Button>
          <Button href="/ramp" variant="outline" block>Back to home</Button>
        </div>
      </div>
    </div>
  );
}

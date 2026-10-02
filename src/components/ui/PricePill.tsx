import "./ui.css";

const money = (cents: number) =>
  cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;

/** The $24 pill. Takes the page's area accent when one is set. */
export function PricePill({
  cents,
  size = "sm",
  soldOut = false,
}: {
  cents: number;
  size?: "sm" | "lg";
  soldOut?: boolean;
}) {
  return (
    <span className={`pricePill pricePill--${size}${soldOut ? " pricePill--soldOut" : ""}`}>
      {soldOut ? "Sold out" : money(cents)}
    </span>
  );
}

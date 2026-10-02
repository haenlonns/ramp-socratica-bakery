import Link from "next/link";

/** Shown in place of a drawer tab that has nothing to list yet. */
export function EmptyPurchases({ className }: { className?: string }) {
  return (
    <div className={className ? `rampEmpty ${className}` : "rampEmpty"}>
      <img className="rampEmptyArt" src="/ramp/empty-purchases.png" alt="" aria-hidden />
      <div className="rampEmptyText">
        <p className="rampEmptyTitle">No Purchases yet</p>
        <Link href="/store/market" className="rampEmptyLink">Browse Items &rarr;</Link>
      </div>
    </div>
  );
}

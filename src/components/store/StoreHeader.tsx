"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStoreCart } from "./StoreCart";

/** The cart chip is always live; the dollar chip only where the gallery and cart need it. */
export function StoreHeader({ showCart = false }: { showCart?: boolean }) {
  return (
    <header className="storeHeader">
      <div className="storeLogos">
        <Link href="/ramp" className="storeLogo" aria-label="Back to Ramp">
          <img className="storeLogoRamp" src="/store/ramp-logo.svg" alt="" aria-hidden />
        </Link>
        <Link href="/store" className="storeLogo" aria-label="Socratica Store">
          <img src="/store/logo.svg" alt="" aria-hidden />
        </Link>
      </div>

      <p className="storeTagline">
        <span className="storeRule" aria-hidden />
        For the love of making dough.
        <span className="storeRule" aria-hidden />
      </p>

      <StoreChips showDollars={showCart} />
    </header>
  );
}

/** Replays a short bump whenever the value changes (not on first paint). */
function useBump(value: number) {
  const previous = useRef(value);
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setTicks((count) => count + 1);
  }, [value]);
  return ticks;
}

function StoreChips({ showDollars }: { showDollars: boolean }) {
  const { count, totalCents } = useStoreCart();
  const dollars = Math.round(totalCents / 100);
  const cartBump = useBump(count);
  const dollarBump = useBump(dollars);

  return (
    <div className="storeChips">
      <Link href="/store/cart" key={`c${cartBump}`} className={cartBump ? "storeCart storeCart--bump" : "storeCart"}>
        Cart &mdash; {count}
      </Link>
      {showDollars && (
        <span key={`d${dollarBump}`} className={dollarBump ? "storeCart storeCart--bump" : "storeCart"}>
          Dollar &mdash; {dollars}
        </span>
      )}
    </div>
  );
}

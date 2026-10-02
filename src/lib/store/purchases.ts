"use client";

import { useSyncExternalStore } from "react";

/**
 * Completed store purchases, kept in localStorage so the Ramp home page, the
 * card balance and the store's budget check all read the same history.
 * Same shape of external store as the Ramp config: the server snapshot is
 * empty, so markup matches on hydration.
 */

export type Purchase = {
  id: string;
  /** Epoch milliseconds. */
  at: number;
  lines: { productId: string; quantity: number }[];
  totalCents: number;
};

const STORAGE_KEY = "socratica-purchases";
const EMPTY: Purchase[] = [];

let cache: Purchase[] | null = null;
const listeners = new Set<() => void>();

function read(): Purchase[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Purchase[];
    }
  } catch {
    // Private mode or blocked storage: behave as if nothing was bought.
  }
  return EMPTY;
}

function emit() {
  for (const listener of listeners) listener();
}

function write(next: Purchase[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Non-fatal; the history still applies for this session.
  }
  emit();
}

function getSnapshot(): Purchase[] {
  if (cache === null) cache = read();
  return cache;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Newest first. */
export function usePurchases() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function spentCents(purchases: Purchase[]) {
  return purchases.reduce((sum, purchase) => sum + purchase.totalCents, 0);
}

export function recordPurchase(lines: Purchase["lines"], totalCents: number): string {
  const purchase: Purchase = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    lines,
    totalCents,
  };
  write([purchase, ...getSnapshot()].slice(0, 20));
  return purchase.id;
}

/** Undo a recorded purchase, e.g. when the server then rejects the order. */
export function removePurchase(id: string) {
  write(getSnapshot().filter((purchase) => purchase.id !== id));
}

export function clearPurchases() {
  write(EMPTY);
}

/** Dev only: seeds a few purchases so the populated home page can be previewed. */
export function seedSamplePurchases() {
  const hour = 60 * 60 * 1000;
  write([
    { id: "s4", at: Date.now() - 1 * hour, lines: [{ productId: "castella-cake", quantity: 1 }], totalCents: 2400 },
    { id: "s3", at: Date.now() - 2 * hour, lines: [{ productId: "blueberry", quantity: 2 }, { productId: "raspberry", quantity: 1 }], totalCents: 3500 },
    { id: "s2", at: Date.now() - 5 * hour, lines: [{ productId: "honey", quantity: 1 }], totalCents: 1400 },
    { id: "s1", at: Date.now() - 26 * hour, lines: [{ productId: "granola", quantity: 1 }], totalCents: 1500 },
  ]);
}

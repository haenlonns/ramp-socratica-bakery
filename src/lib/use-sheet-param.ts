"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const PUSHED_KEY = "sheet-pushed";

/** Call from a trigger's onClick so closing can step back instead of stacking history. */
export function markSheetOpened() {
  try {
    sessionStorage.setItem(PUSHED_KEY, "1");
  } catch {
    // Storage blocked: closing falls back to a replace, which is still correct.
  }
}

/**
 * A sheet that lives in the URL (`?item=castella-cake`, `?about`). Opening is a
 * normal link push, so the browser back button closes it and the URL can be
 * shared. Closing uses `back()` when this session opened it, and `replace()`
 * when someone landed on the URL directly.
 */
export function useSheetParam(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get(key);

  const close = useCallback(() => {
    let pushed = false;
    try {
      pushed = sessionStorage.getItem(PUSHED_KEY) === "1";
      sessionStorage.removeItem(PUSHED_KEY);
    } catch {
      // Treated as a direct landing.
    }
    if (pushed && window.history.length > 1) router.back();
    else router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { value, isOpen: value !== null, close };
}

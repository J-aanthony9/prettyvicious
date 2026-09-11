"use client";

import { useEffect } from "react";

// Reference counted so the cart drawer, the lightbox and the mobile menu can
// each lock the page without unlocking it out from under one another.
let locks = 0;

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    document.body.style.overflow = "hidden";
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0) document.body.style.overflow = "";
    };
  }, [active]);
}

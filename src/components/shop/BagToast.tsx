"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Portal from "@/components/Portal";

/**
 * The moment after "Add to bag": a small card at the bottom of the screen,
 * in thumb reach, with the two things people want next. It leaves on its
 * own after a few seconds and never blocks the page.
 */
export default function BagToast({ token, label }: { token: number; label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!token) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, [token]);

  if (!visible) return null;

  return (
    <Portal>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div
          role="status"
          className="toast pointer-events-auto w-full max-w-md border border-[color:var(--hairline)] bg-veil-deep p-4 shadow-[0_18px_48px_rgba(0,0,0,0.55)]"
        >
          <p className="text-[13px] leading-snug text-bone">
            <span className="text-accent">✦</span> Added to bag
          </p>
          <p className="mt-1 truncate text-[12px] text-[color:var(--bone-dim)]">{label}</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="btn min-h-[44px] px-3 py-2 text-[11px] tracking-[0.12em]!"
            >
              Keep shopping
            </button>
            <Link href="/cart" className="btn btn-solid min-h-[44px] px-3 py-2 text-[11px] tracking-[0.12em]!">
              View bag
            </Link>
          </div>
        </div>
      </div>
    </Portal>
  );
}

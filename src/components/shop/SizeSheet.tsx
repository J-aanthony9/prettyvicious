"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Portal from "@/components/Portal";
import SizeChart from "@/components/shop/SizeChart";
import { FIT_NOTES } from "@/lib/brand";
import { GARMENTS, sizeGuideHref, type GarmentKey } from "@/lib/garments";
import { SIZE_GUIDE_TOLERANCE } from "@/lib/size-guide";
import { useScrollLock } from "@/lib/use-scroll-lock";

const TRIGGER = "link-quiet shrink-0 py-1 text-[11px] uppercase tracking-[0.2em]";

/**
 * "Size guide" on the product page. Opens the product's own chart in a sheet
 * over the page, so the chosen size and design are still there when it
 * closes. Swipe it down, tap outside, press Escape or use Close. A product
 * with no known garment type falls back to a link to the full guide.
 */
export default function SizeSheet({ garment }: { garment: GarmentKey | null }) {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(0);
  const startY = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!garment) {
    return (
      <Link href={sizeGuideHref(null)} className={TRIGGER}>
        Size guide
      </Link>
    );
  }

  const fitNote = FIT_NOTES[garment];
  const close = () => {
    setOpen(false);
    setDrag(0);
  };

  // Drag down from the top of the sheet to dismiss, like a native sheet.
  const onTouchStart = (event: React.TouchEvent) => {
    startY.current = event.touches[0].clientY;
  };
  const onTouchMove = (event: React.TouchEvent) => {
    if (startY.current === null) return;
    setDrag(Math.max(0, event.touches[0].clientY - startY.current));
  };
  const onTouchEnd = () => {
    if (drag > 90) close();
    else setDrag(0);
    startY.current = null;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={TRIGGER}
        aria-haspopup="dialog"
      >
        Size guide
      </button>

      {open ? (
        <Portal>
          <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center">
            <div className="sheet-backdrop absolute inset-0 bg-ink/75 backdrop-blur-[2px]" onClick={close} />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-sheet-title"
              className="sheet relative flex max-h-[88dvh] w-full max-w-2xl flex-col border-t border-[color:var(--hairline)] bg-veil md:rounded md:border"
              style={drag ? { transform: `translateY(${drag}px)`, transition: "none" } : undefined}
            >
              <div
                className="shrink-0 cursor-grab touch-none px-5 pb-3 pt-3 sm:px-8"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-[color:var(--hairline)] md:hidden" />
                <div className="mt-3 flex items-center justify-between gap-4">
                  <h2 id="size-sheet-title" className="display text-[15px] tracking-[0.16em]">
                    {GARMENTS[garment].label}
                  </h2>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    className="min-h-[44px] px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-bone"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto overscroll-contain px-5 pb-[max(24px,env(safe-area-inset-bottom))] sm:px-8">
                {fitNote ? (
                  <div className="mb-6 border-l border-[color:var(--color-accent-deep)] bg-veil-deep p-5">
                    <h3 className="display text-[11px] tracking-[0.22em]">{fitNote.heading}</h3>
                    <p className="dim mt-3 text-[14px] leading-[1.75]">{fitNote.body}</p>
                  </div>
                ) : null}
                <SizeChart garment={garment} />
                <p className="mt-4 text-[13px] text-[color:var(--bone-faint)]">{SIZE_GUIDE_TOLERANCE}</p>
                <Link
                  href={sizeGuideHref(garment)}
                  className="link-quiet mt-6 inline-block py-1 text-[11px] uppercase tracking-[0.22em] text-bone"
                >
                  How to measure
                </Link>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
}

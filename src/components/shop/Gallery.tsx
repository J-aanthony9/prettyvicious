"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ShopifyImage } from "@/lib/shopify/types";

/**
 * Product images, never cropped.
 *
 * Supplier mockups and size charts arrive at different aspect ratios, and a
 * size chart with its edges cut off is worse than no chart, so the frame
 * letterboxes with object-contain instead of filling with object-cover. The
 * frame is white because the supplier's images are shot on white, so the
 * letterbox disappears. If the photography ever goes dark, change this one
 * background and it will still be correct.
 */
const FRAME = "bg-white";

export default function Gallery({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = images[active];
  const count = images.length;

  const step = useCallback(
    (delta: number) => setActive((index) => (index + delta + count) % count),
    [count],
  );

  // Keyboard: Escape closes, arrows move, and the page stops scrolling
  // behind the lightbox while it is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center border border-dashed border-[color:var(--hairline)] bg-veil text-accent">
        ✦
      </div>
    );
  }

  const alt = current.altText || title;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden border border-[color:var(--hairline)] ${FRAME}`}
        aria-label={`Open ${alt} full size`}
      >
        <Image
          src={current.url}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain"
        />
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-sm bg-ink/80 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-bone opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          Tap to zoom
        </span>
      </button>

      {count > 1 ? (
        <div className="grid grid-cols-5 gap-3">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={image.altText || `View image ${index + 1}`}
              aria-current={index === active}
              className={`relative aspect-square overflow-hidden border transition-colors duration-400 ${FRAME} ${
                index === active
                  ? "border-[color:var(--color-accent)]"
                  : "border-[color:var(--hairline)] hover:border-[color:var(--color-accent-deep)]"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="120px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--bone-dim)]">
              {active + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bone"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div
            className={`relative mx-4 mb-4 flex-1 overflow-hidden ${FRAME}`}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={current.url}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {count > 1 ? (
            <div className="flex justify-center gap-3 pb-5" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={() => step(-1)} className="btn" aria-label="Previous image">
                Prev
              </button>
              <button type="button" onClick={() => step(1)} className="btn" aria-label="Next image">
                Next
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

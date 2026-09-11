"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ShopifyImage } from "@/lib/shopify/types";
import { useScrollLock } from "@/lib/use-scroll-lock";
import Portal from "@/components/Portal";

/**
 * Product images, never cropped.
 *
 * Supplier mockups and size charts arrive at different aspect ratios, and a
 * size chart with its edges cut off is worse than no chart, so every frame
 * letterboxes with object-contain. The frame is white because the supplier's
 * images are shot on white, so the letterbox disappears. If the photography
 * ever goes dark, change this one background and it will still be correct.
 *
 * Phones get a snap scrolling track you swipe with a thumb. Wider screens get
 * one image with thumbnails. Both open the same lightbox.
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
  const trackRef = useRef<HTMLDivElement>(null);
  const count = images.length;
  const current = images[active];

  useScrollLock(open);

  const step = useCallback(
    (delta: number) => setActive((index) => (index + delta + count) % count),
    [count],
  );

  // Keep the active index in step with wherever the thumb left the track.
  const onTrackScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== active) setActive(index);
  };

  const scrollTrackTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
      {/* Phone: swipe track */}
      <div className="md:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Product images"
        >
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => {
                setActive(index);
                setOpen(true);
              }}
              className={`relative aspect-[4/5] w-full shrink-0 snap-center border border-[color:var(--hairline)] ${FRAME}`}
              aria-label={`Open ${image.altText || title} full size`}
            >
              <Image
                src={image.url}
                alt={image.altText || title}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-contain"
              />
            </button>
          ))}
        </div>
        {count > 1 ? (
          <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Image position">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Image ${index + 1} of ${count}`}
                onClick={() => scrollTrackTo(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === active ? "w-6 bg-accent" : "w-1.5 bg-[color:var(--hairline)]"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Wider screens: one image, thumbnails */}
      <div className="hidden flex-col gap-4 md:flex">
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
            sizes="50vw"
            className="object-contain"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-sm bg-ink/80 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-bone opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            Click to zoom
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
                <Image src={image.url} alt="" fill sizes="120px" className="object-contain" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {open ? (
        <Portal>
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
            <Image src={current.url} alt={alt} fill sizes="100vw" className="object-contain" />
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
        </Portal>
      ) : null}
    </div>
  );
}

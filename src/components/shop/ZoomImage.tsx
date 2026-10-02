"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ShopifyImage } from "@/lib/shopify/types";

const MAX = 4;

type View = { scale: number; x: number; y: number };
const RESET: View = { scale: 1, x: 0, y: 0 };

/**
 * The lightbox image, zoomable for print detail. Pinch with two fingers,
 * drag to pan once zoomed, double tap to jump in or back out. No library:
 * pointer events and one CSS transform.
 */
export default function ZoomImage({ image, alt }: { image: ShopifyImage; alt: string }) {
  const [view, setView] = useState<View>(RESET);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const lastTap = useRef(0);
  const lastPointer = useRef("mouse");

  const clamp = (next: View): View => {
    const scale = Math.min(MAX, Math.max(1, next.scale));
    if (scale === 1) return RESET;
    // Keep the image covering the frame rather than drifting off it.
    const limit = (scale - 1) * 200;
    return {
      scale,
      x: Math.max(-limit, Math.min(limit, next.x)),
      y: Math.max(-limit, Math.min(limit, next.y)),
    };
  };

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    lastPointer.current = event.pointerType;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) pinch.current = { distance: distance(), scale: view.scale };

    if (pointers.current.size === 1 && event.pointerType !== "mouse") {
      const now = Date.now();
      if (now - lastTap.current < 280) {
        setView((current) => (current.scale > 1 ? RESET : { scale: 2.5, x: 0, y: 0 }));
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const ratio = distance() / pinch.current.distance;
      setView((current) => clamp({ ...current, scale: pinch.current!.scale * ratio }));
    } else if (pointers.current.size === 1 && view.scale > 1) {
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      setView((current) => clamp({ ...current, x: current.x + dx, y: current.y + dy }));
    }
  };

  const onPointerUp = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => {
        // Touch already toggled on the second tap; the browser's synthetic
        // dblclick that follows would undo it.
        if (lastPointer.current !== "mouse") return;
        setView((current) => (current.scale > 1 ? RESET : { scale: 2.5, x: 0, y: 0 }));
      }}
    >
      <div
        className="absolute inset-0 transition-transform duration-150 ease-out"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        <Image src={image.url} alt={alt} fill sizes="100vw" className="object-contain" draggable={false} />
      </div>
      {view.scale === 1 ? (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-sm bg-ink/75 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-bone">
          Pinch or double tap to zoom
        </span>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children at the end of <body>.
 *
 * Fixed overlays that live inside <main> are trapped in its stacking
 * context, so a later sibling like the footer paints over them wherever the
 * two overlap. Anything that must sit above the whole page goes through here.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.body), []);
  return target ? createPortal(children, target) : null;
}
